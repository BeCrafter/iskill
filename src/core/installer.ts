import * as path from 'path';
import * as fs from 'fs-extra';
import { copyDir, removeFile, removeDir, fileExists, isDirectory, ensureDir } from '../utils/file';
import { createGitHelper, GitHelper } from '../utils/git';
import { Skill, InstallOptions } from '../types';
import { Resolver } from './resolver';
import { Scanner } from './scanner';
import { PathManager } from './path-manager';
import { logger } from '../utils/logger';

export class Installer {
  private resolver: Resolver;
  private scanner: Scanner;
  private pathManager: PathManager;

  constructor(
    resolver?: Resolver,
    scanner?: Scanner,
    pathManager?: PathManager
  ) {
    this.resolver = resolver || new Resolver();
    this.scanner = scanner || new Scanner();
    this.pathManager = pathManager || new PathManager();
  }

  async install(
    source: string,
    targetPath: string,
    options: InstallOptions = {}
  ): Promise<void> {
    const resolvedPath = this.pathManager.resolvePath(targetPath);
    await this.pathManager.ensurePathExists(resolvedPath);

    if (options.list) {
      await this.listAndInstall(source, resolvedPath, options);
      return;
    }

    const skills = await this.resolver.listSkills(source);
    
    if (skills.length === 0) {
      logger.warn(`No skills found in ${source}`);
      return;
    }

    let skillsToInstall: Skill[] = skills;

    if (options.skills && options.skills.length > 0) {
      if (options.skills[0] === '*') {
        skillsToInstall = skills;
      } else {
        skillsToInstall = skills.filter(s => 
          options.skills!.includes(s.name)
        );
      }
    }

    if (skillsToInstall.length === 0) {
      logger.warn('No matching skills found');
      return;
    }

    const method = options.method || 'symlink';

    for (const skill of skillsToInstall) {
      await this.installSkill(skill, resolvedPath, method, source);
    }

    logger.success(`Successfully installed ${skillsToInstall.length} skill(s)`);
  }

  private async listAndInstall(
    source: string,
    targetPath: string,
    options: InstallOptions
  ): Promise<void> {
    const skills = await this.resolver.listSkills(source);
    
    if (skills.length === 0) {
      logger.warn(`No skills found in ${source}`);
      return;
    }

    logger.plain('\nAvailable skills:');
    logger.plain('─'.repeat(80));
    
    for (const skill of skills) {
      logger.plain(`  • ${skill.name}`);
      logger.plain(`    ${skill.description}`);
      logger.plain('');
    }
  }

  async installSkill(
    skill: Skill,
    targetPath: string,
    method: 'symlink' | 'copy' = 'symlink',
    source?: string
  ): Promise<void> {
    const skillTargetPath = path.join(targetPath, skill.name);

    try {
      const exists = await fileExists(skillTargetPath);
      
      if (exists) {
        logger.warn(`Skill ${skill.name} already exists at ${skillTargetPath}`);
        return;
      }

      if (method === 'symlink') {
        await this.installSymlink(skill.path, skillTargetPath);
        logger.debug(`Created symlink: ${skill.name}`);
      } else {
        await this.installCopy(skill.path, skillTargetPath);
        logger.debug(`Copied skill: ${skill.name}`);
      }

      logger.success(`Installed ${skill.name}`);
    } catch (error) {
      logger.error(`Failed to install ${skill.name}: ${error}`);
      throw error;
    }
  }

  private async installSymlink(source: string, target: string): Promise<void> {
    await ensureDir(path.dirname(target));
    await fs.symlink(source, target);
  }

  private async installCopy(source: string, target: string): Promise<void> {
    await ensureDir(path.dirname(target));
    await copyDir(source, target);
  }

  async uninstall(skillName: string, targetPath: string): Promise<void> {
    const resolvedPath = this.pathManager.resolvePath(targetPath);
    const skillPath = path.join(resolvedPath, skillName);

    try {
      const exists = await fileExists(skillPath);
      
      if (!exists) {
        logger.warn(`Skill ${skillName} not found at ${skillPath}`);
        return;
      }

      await removeDir(skillPath);
      logger.success(`Uninstalled ${skillName}`);
    } catch (error) {
      logger.error(`Failed to uninstall ${skillName}: ${error}`);
      throw error;
    }
  }

  async update(skillName: string, targetPath: string): Promise<void> {
    const resolvedPath = this.pathManager.resolvePath(targetPath);
    const skillPath = path.join(resolvedPath, skillName);

    try {
      const exists = await fileExists(skillPath);
      
      if (!exists) {
        logger.warn(`Skill ${skillName} not found at ${skillPath}`);
        return;
      }

      const isSymlink = await this.isSymlink(skillPath);

      if (isSymlink) {
        logger.info(`${skillName} is a symlink, updating source`);
        await this.updateSymlinkSource(skillPath);
      } else {
        logger.info(`${skillName} is a copy, updating`);
        await this.updateCopy(skillPath);
      }

      logger.success(`Updated ${skillName}`);
    } catch (error) {
      logger.error(`Failed to update ${skillName}: ${error}`);
      throw error;
    }
  }

  private async isSymlink(filePath: string): Promise<boolean> {
    try {
      const stats = await fs.lstat(filePath);
      return stats.isSymbolicLink();
    } catch {
      return false;
    }
  }

  private async updateSymlinkSource(skillPath: string): Promise<void> {
    const targetPath = await fs.readlink(skillPath);
    const git = createGitHelper(targetPath);
    
    try {
      await git.pull();
    } catch (error) {
      logger.warn(`Failed to pull updates for ${skillPath}: ${error}`);
    }
  }

  private async updateCopy(skillPath: string): Promise<void> {
    const git = createGitHelper(skillPath);
    
    try {
      await git.pull();
    } catch (error) {
      logger.warn(`Failed to pull updates for ${skillPath}: ${error}`);
    }
  }

  async updateAll(targetPath: string): Promise<void> {
    const resolvedPath = this.pathManager.resolvePath(targetPath);
    const skills = await this.scanner.scan(resolvedPath);

    for (const skill of skills) {
      await this.update(skill.name, resolvedPath);
    }

    logger.success(`Updated ${skills.length} skill(s)`);
  }

  async checkUpdates(targetPath: string): Promise<Map<string, boolean>> {
    const resolvedPath = this.pathManager.resolvePath(targetPath);
    const skills = await this.scanner.scan(resolvedPath);
    const updates = new Map<string, boolean>();

    for (const skill of skills) {
      const hasUpdate = await this.checkSkillUpdate(skill);
      updates.set(skill.name, hasUpdate);
    }

    return updates;
  }

  private async checkSkillUpdate(skill: Skill): Promise<boolean> {
    const git = createGitHelper(skill.path);
    
    try {
      return await git.hasUpdates();
    } catch {
      return false;
    }
  }

  async installFromSource(
    source: string,
    targetPath: string,
    options: InstallOptions = {}
  ): Promise<void> {
    const resolvedPath = this.pathManager.resolvePath(targetPath);
    await this.pathManager.ensurePathExists(resolvedPath);

    const tempDir = path.join(resolvedPath, '.temp', Date.now().toString());
    
    try {
      await this.resolver.clone(source, tempDir);
      const skills = await this.scanner.scan(tempDir);

      let skillsToInstall = skills;
      
      if (options.skills && options.skills.length > 0) {
        if (options.skills[0] === '*') {
          skillsToInstall = skills;
        } else {
          skillsToInstall = skills.filter(s => 
            options.skills!.includes(s.name)
          );
        }
      }

      const method = options.method || 'copy';

      for (const skill of skillsToInstall) {
        const skillSourcePath = path.join(tempDir, skill.name);
        const skillTargetPath = path.join(resolvedPath, skill.name);
        
        await this.installSkill(
          { ...skill, path: skillSourcePath },
          skillTargetPath,
          method,
          source
        );
      }

      logger.success(`Successfully installed ${skillsToInstall.length} skill(s)`);
    } finally {
      await removeDir(tempDir);
    }
  }
}

export function createInstaller(
  resolver?: Resolver,
  scanner?: Scanner,
  pathManager?: PathManager
): Installer {
  return new Installer(resolver, scanner, pathManager);
}
