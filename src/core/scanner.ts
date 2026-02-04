import * as path from 'path';
import * as YAML from 'yaml';
import { readFile, fileExists, isDirectory, listFiles, joinPath } from '../utils/file';
import { Skill, SkillMetadata } from '../types';
import { logger } from '../utils/logger';

const SKILL_FILE = 'SKILL.md';
const SKILL_DIRECTORIES = [
  'skills',
  'skills/.curated',
  'skills/.experimental',
  'skills/.system',
  '.agents/skills',
  '.agent/skills',
  '.claude/skills',
  '.cline/skills',
  '.codebuddy/skills',
  '.codex/skills',
  '.commandcode/skills',
  '.continue/skills',
  '.crush/skills',
  '.cursor/skills',
  '.factory/skills',
  '.gemini/skills',
  '.github/skills',
  '.goose/skills',
  '.junie/skills',
  '.iflow/skills',
  '.kilocode/skills',
  '.kiro/skills',
  '.kode/skills',
  '.mcpjam/skills',
  '.vibe/skills',
  '.mux/skills',
  '.opencode/skills',
  '.openhands/skills',
  '.pi/skills',
  '.qoder/skills',
  '.qwen/skills',
  '.roo/skills',
  '.trae/skills',
  '.windsurf/skills',
  '.zencoder/skills',
  '.neovate/skills',
  '.pochi/skills',
  '.adal/skills'
];

export class Scanner {
  private basePath: string;

  constructor(basePath?: string) {
    this.basePath = basePath || process.cwd();
  }

  async scan(targetPath: string): Promise<Skill[]> {
    const skills: Skill[] = [];
    const absolutePath = path.resolve(this.basePath, targetPath);

    try {
      const exists = await fileExists(absolutePath);
      if (!exists) {
        logger.warn(`Path does not exist: ${absolutePath}`);
        return skills;
      }

      const isDir = await isDirectory(absolutePath);
      if (!isDir) {
        logger.warn(`Path is not a directory: ${absolutePath}`);
        return skills;
      }

      const skillDirs = await this.findSkillDirectories(absolutePath);
      
      for (const skillDir of skillDirs) {
        const skill = await this.parseSkill(skillDir);
        if (skill) {
          skills.push(skill);
        }
      }

      logger.debug(`Found ${skills.length} skills in ${absolutePath}`);
    } catch (error) {
      logger.error(`Error scanning path ${absolutePath}: ${error}`);
    }

    return skills;
  }

  async findSkillDirectories(rootPath: string): Promise<string[]> {
    const skillDirs: string[] = [];

    for (const dir of SKILL_DIRECTORIES) {
      const dirPath = joinPath(rootPath, dir);
      const exists = await fileExists(dirPath);
      
      if (exists) {
        const subSkills = await this.findSkillsInDirectory(dirPath);
        skillDirs.push(...subSkills);
      }
    }

    if (skillDirs.length === 0) {
      const rootSkills = await this.findSkillsInDirectory(rootPath);
      skillDirs.push(...rootSkills);
    }

    return skillDirs;
  }

  private async findSkillsInDirectory(dirPath: string): Promise<string[]> {
    const skillDirs: string[] = [];

    try {
      const entries = await listFiles(dirPath);
      
      for (const entry of entries) {
        const entryPath = joinPath(dirPath, entry);
        const isDir = await isDirectory(entryPath);
        
        if (isDir) {
          const skillFile = joinPath(entryPath, SKILL_FILE);
          const hasSkillFile = await fileExists(skillFile);
          
          if (hasSkillFile) {
            skillDirs.push(entryPath);
          }
        } else if (entry === SKILL_FILE) {
          skillDirs.push(dirPath);
        }
      }
    } catch (error) {
      logger.debug(`Error reading directory ${dirPath}: ${error}`);
    }

    return skillDirs;
  }

  async findSkillFile(dirPath: string): Promise<string | null> {
    const skillFile = joinPath(dirPath, SKILL_FILE);
    const exists = await fileExists(skillFile);
    return exists ? skillFile : null;
  }

  async parseSkill(skillDir: string): Promise<Skill | null> {
    try {
      const skillFile = await this.findSkillFile(skillDir);
      
      if (!skillFile) {
        return null;
      }

      const content = await readFile(skillFile);
      const skill = this.parseSkillContent(content, skillDir);
      
      if (skill) {
        logger.debug(`Parsed skill: ${skill.name}`);
      }
      
      return skill;
    } catch (error) {
      logger.error(`Error parsing skill in ${skillDir}: ${error}`);
      return null;
    }
  }

  private parseSkillContent(content: string, skillDir: string): Skill | null {
    try {
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      
      if (!frontmatterMatch) {
        logger.warn(`No frontmatter found in ${skillDir}`);
        return null;
      }

      const frontmatter = YAML.parse(frontmatterMatch[1]);
      const name = frontmatter.name;
      const description = frontmatter.description;

      if (!name || !description) {
        logger.warn(`Missing name or description in ${skillDir}`);
        return null;
      }

      const skill: Skill = {
        name,
        description,
        path: skillDir,
        metadata: frontmatter.metadata || {}
      };

      if (frontmatter.version) {
        skill.version = frontmatter.version;
      }

      return skill;
    } catch (error) {
      logger.error(`Error parsing skill content: ${error}`);
      return null;
    }
  }

  async scanMultiple(paths: string[]): Promise<Map<string, Skill[]>> {
    const result = new Map<string, Skill[]>();

    for (const targetPath of paths) {
      const skills = await this.scan(targetPath);
      result.set(targetPath, skills);
    }

    return result;
  }
}

export function createScanner(basePath?: string): Scanner {
  return new Scanner(basePath);
}
