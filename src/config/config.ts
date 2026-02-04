import * as path from 'path';
import * as os from 'os';
import { readFile, writeFile, fileExists, resolvePath } from '../utils/file';
import { Config } from '../types';
import { logger } from '../utils/logger';

const DEFAULT_CONFIG: Config = {
  defaultPath: './skills',
  paths: [],
  installMethod: 'symlink',
  autoUpdate: false,
  telemetry: true
};

const PROJECT_CONFIG_FILE = '.iskillrc.json';
const GLOBAL_CONFIG_DIR = path.join(os.homedir(), '.iskill');
const GLOBAL_CONFIG_FILE = path.join(GLOBAL_CONFIG_DIR, 'config.json');

export class ConfigManager {
  private projectConfigPath: string;
  private globalConfigPath: string;
  private cwd: string;

  constructor(cwd?: string) {
    this.cwd = cwd || process.cwd();
    this.projectConfigPath = path.join(this.cwd, PROJECT_CONFIG_FILE);
    this.globalConfigPath = GLOBAL_CONFIG_FILE;
  }

  async load(): Promise<Config> {
    let config = { ...DEFAULT_CONFIG };

    try {
      const globalConfig = await this.loadConfigFile(this.globalConfigPath);
      config = { ...config, ...globalConfig };
    } catch (error) {
      logger.debug('No global config found, using defaults');
    }

    try {
      const projectConfig = await this.loadConfigFile(this.projectConfigPath);
      config = { ...config, ...projectConfig };
    } catch (error) {
      logger.debug('No project config found, using global or defaults');
    }

    return config;
  }

  async loadProject(): Promise<Config> {
    try {
      const projectConfig = await this.loadConfigFile(this.projectConfigPath);
      return { ...DEFAULT_CONFIG, ...projectConfig };
    } catch (error) {
      return { ...DEFAULT_CONFIG };
    }
  }

  async loadGlobal(): Promise<Config> {
    try {
      const globalConfig = await this.loadConfigFile(this.globalConfigPath);
      return { ...DEFAULT_CONFIG, ...globalConfig };
    } catch (error) {
      return { ...DEFAULT_CONFIG };
    }
  }

  async saveProject(config: Config): Promise<void> {
    try {
      await writeFile(this.projectConfigPath, JSON.stringify(config, null, 2));
      logger.success(`Project config saved to ${this.projectConfigPath}`);
    } catch (error) {
      logger.error(`Failed to save project config: ${error}`);
      throw error;
    }
  }

  async saveGlobal(config: Config): Promise<void> {
    try {
      await writeFile(this.globalConfigPath, JSON.stringify(config, null, 2));
      logger.success(`Global config saved to ${this.globalConfigPath}`);
    } catch (error) {
      logger.error(`Failed to save global config: ${error}`);
      throw error;
    }
  }

  async hasProjectConfig(): Promise<boolean> {
    return await fileExists(this.projectConfigPath);
  }

  async hasGlobalConfig(): Promise<boolean> {
    return await fileExists(this.globalConfigPath);
  }

  getProjectConfigPath(): string {
    return this.projectConfigPath;
  }

  getGlobalConfigPath(): string {
    return this.globalConfigPath;
  }

  private async loadConfigFile(filePath: string): Promise<Partial<Config>> {
    const exists = await fileExists(filePath);
    if (!exists) {
      throw new Error(`Config file not found: ${filePath}`);
    }

    const content = await readFile(filePath);
    return JSON.parse(content);
  }

  async initGlobal(): Promise<void> {
    const exists = await fileExists(this.globalConfigPath);
    if (!exists) {
      await this.saveGlobal(DEFAULT_CONFIG);
      logger.info(`Initialized global config at ${this.globalConfigPath}`);
    }
  }

  async initProject(): Promise<void> {
    const exists = await fileExists(this.projectConfigPath);
    if (!exists) {
      await this.saveProject(DEFAULT_CONFIG);
      logger.info(`Initialized project config at ${this.projectConfigPath}`);
    }
  }
}

export function createConfigManager(cwd?: string): ConfigManager {
  return new ConfigManager(cwd);
}
