import * as path from 'path';
import * as os from 'os';
import { fileExists, isDirectory, removeDir, ensureDir } from '../utils/file';
import { createGitHelper, GitHelper } from '../utils/git';
import { ResolvedSource, Skill } from '../types';
import { Scanner } from './scanner';
import { logger } from '../utils/logger';

const CACHE_DIR = path.join(os.homedir(), '.iskill', 'cache');

export class Resolver {
  private scanner: Scanner;
  private cacheDir: string;

  constructor(cacheDir?: string) {
    this.scanner = new Scanner();
    this.cacheDir = cacheDir || CACHE_DIR;
  }

  async resolve(source: string): Promise<ResolvedSource> {
    const trimmedSource = source.trim();

    if (trimmedSource.startsWith('./') || trimmedSource.startsWith('/') || trimmedSource.startsWith('../')) {
      return this.resolveLocalPath(trimmedSource);
    }

    if (trimmedSource.startsWith('http://') || trimmedSource.startsWith('https://')) {
      return this.resolveUrl(trimmedSource);
    }

    if (trimmedSource.startsWith('git@')) {
      return this.resolveGitUrl(trimmedSource);
    }

    if (trimmedSource.includes('/')) {
      return this.resolveGitHubShorthand(trimmedSource);
    }

    return this.resolveLocalPath(trimmedSource);
  }

  private resolveUrl(url: string): ResolvedSource {
    if (url.includes('github.com')) {
      return {
        type: 'github',
        url: this.normalizeGitHubUrl(url)
      };
    }

    if (url.includes('gitlab.com')) {
      return {
        type: 'gitlab',
        url
      };
    }

    return {
      type: 'git',
      url
    };
  }

  private resolveGitUrl(url: string): ResolvedSource {
    return {
      type: 'git',
      url
    };
  }

  private resolveGitHubShorthand(shorthand: string): ResolvedSource {
    const [owner, repo, ...rest] = shorthand.split('/');
    const repoName = repo || '';
    const subPath = rest.length > 0 ? rest.join('/') : '';

    const url = `https://github.com/${owner}/${repoName}`;

    return {
      type: 'github',
      url,
      path: subPath || undefined
    };
  }

  private resolveLocalPath(localPath: string): ResolvedSource {
    const resolvedPath = path.resolve(localPath);
    return {
      type: 'local',
      url: resolvedPath,
      path: resolvedPath
    };
  }

  private normalizeGitHubUrl(url: string): string {
    const normalized = url.replace(/\/tree\/[^/]+$/, '');
    return normalized.endsWith('.git') ? normalized : `${normalized}.git`;
  }

  async listSkills(source: string): Promise<Skill[]> {
    const resolved = await this.resolve(source);

    try {
      let scanPath: string;
      
      if (resolved.type === 'local') {
        scanPath = resolved.path || source;
      } else {
        const cachePath = await this.getCachePath(resolved);
        await this.cloneIfNeeded(resolved, cachePath);
        scanPath = resolved.path ? path.join(cachePath, resolved.path) : cachePath;
      }

      const skills = await this.scanner.scan(scanPath);

      logger.debug(`Found ${skills.length} skills in ${source}`);
      return skills;
    } catch (error) {
      logger.error(`Error listing skills from ${source}: ${error}`);
      return [];
    }
  }

  async clone(source: string, targetDir: string): Promise<void> {
    const resolved = await this.resolve(source);
    const git = createGitHelper();

    try {
      logger.info(`Cloning ${source} to ${targetDir}`);
      
      if (resolved.type === 'local') {
        await this.copyLocal(resolved.path!, targetDir);
      } else {
        await git.clone(resolved.url, targetDir);
      }
      
      logger.success(`Successfully cloned ${source}`);
    } catch (error) {
      logger.error(`Error cloning ${source}: ${error}`);
      throw error;
    }
  }

  private async cloneIfNeeded(resolved: ResolvedSource, cachePath: string): Promise<void> {
    const exists = await fileExists(cachePath);

    if (!exists) {
      await this.cloneToCache(resolved, cachePath);
    }
  }

  private async cloneToCache(resolved: ResolvedSource, cachePath: string): Promise<void> {
    await ensureDir(this.cacheDir);
    const git = createGitHelper();

    try {
      logger.debug(`Cloning to cache: ${resolved.url}`);
      await git.clone(resolved.url, cachePath);
    } catch (error) {
      logger.error(`Error cloning to cache: ${error}`);
      throw error;
    }
  }

  private async copyLocal(sourcePath: string, targetPath: string): Promise<void> {
    const fs = await import('fs-extra');
    await fs.copy(sourcePath, targetPath);
  }

  private async getCachePath(resolved: ResolvedSource): Promise<string> {
    const hash = this.generateHash(resolved.url);
    return path.join(this.cacheDir, hash);
  }

  private generateHash(url: string): string {
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  async clearCache(): Promise<void> {
    try {
      const exists = await fileExists(this.cacheDir);
      if (exists) {
        await removeDir(this.cacheDir);
        logger.success('Cache cleared');
      }
    } catch (error) {
      logger.error(`Error clearing cache: ${error}`);
      throw error;
    }
  }

  getCacheDir(): string {
    return this.cacheDir;
  }
}

export function createResolver(cacheDir?: string): Resolver {
  return new Resolver(cacheDir);
}
