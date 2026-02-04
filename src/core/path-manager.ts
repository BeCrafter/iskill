import * as path from 'path';
import { fileExists, ensureDir, resolvePath, isAbsolute } from '../utils/file';
import { logger } from '../utils/logger';

export class PathManager {
  private cwd: string;

  constructor(cwd?: string) {
    this.cwd = cwd || process.cwd();
  }

  resolvePath(inputPath: string): string {
    if (isAbsolute(inputPath)) {
      return normalizePath(inputPath);
    }
    return normalizePath(resolvePath(this.cwd, inputPath));
  }

  async validatePath(targetPath: string): Promise<boolean> {
    try {
      const resolvedPath = this.resolvePath(targetPath);
      const exists = await fileExists(resolvedPath);
      
      if (!exists) {
        logger.warn(`Path does not exist: ${resolvedPath}`);
        return false;
      }
      
      return true;
    } catch (error) {
      logger.error(`Error validating path: ${error}`);
      return false;
    }
  }

  async ensurePathExists(targetPath: string): Promise<void> {
    const resolvedPath = this.resolvePath(targetPath);
    try {
      await ensureDir(resolvedPath);
      logger.debug(`Ensured path exists: ${resolvedPath}`);
    } catch (error) {
      logger.error(`Error ensuring path exists: ${error}`);
      throw error;
    }
  }

  getDefaultPath(): string {
    return './skills';
  }

  getAllPaths(paths?: string[]): string[] {
    if (paths && paths.length > 0) {
      return paths.map(p => this.resolvePath(p));
    }
    return [this.resolvePath(this.getDefaultPath())];
  }

  getRelativePath(absolutePath: string): string {
    return path.relative(this.cwd, absolutePath);
  }

  getCwd(): string {
    return this.cwd;
  }

  setCwd(cwd: string): void {
    this.cwd = cwd;
  }
}

function normalizePath(filePath: string): string {
  return path.normalize(filePath);
}

export function createPathManager(cwd?: string): PathManager {
  return new PathManager(cwd);
}
