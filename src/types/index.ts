export interface Skill {
  name: string;
  description: string;
  path: string;
  source?: string;
  version?: string;
  metadata?: SkillMetadata;
}

export interface SkillMetadata {
  internal?: boolean;
  [key: string]: any;
}

export interface InstallOptions {
  skills?: string[];
  method?: 'symlink' | 'copy';
  list?: boolean;
  yes?: boolean;
}

export interface ResolvedSource {
  type: 'github' | 'gitlab' | 'git' | 'local';
  url: string;
  path?: string;
  branch?: string;
}

export interface Config {
  defaultPath: string;
  paths: string[];
  installMethod: 'symlink' | 'copy';
  autoUpdate: boolean;
  telemetry: boolean;
}

export interface ListOptions {
  path: string;
}

export interface RemoveOptions {
  path: string;
  skills?: string[];
  yes?: boolean;
  all?: boolean;
}

export interface FindOptions {
  query?: string;
}

export interface CheckOptions {
  path: string;
}

export interface UpdateOptions {
  path: string;
}

export interface InitOptions {
  name?: string;
}
