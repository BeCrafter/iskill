import simpleGit, { SimpleGit } from 'simple-git';

export class GitHelper {
  private git: SimpleGit;

  constructor(baseDir?: string) {
    this.git = simpleGit(baseDir);
  }

  async clone(url: string, targetDir: string, branch?: string): Promise<void> {
    const args = branch ? ['-b', branch] : [];
    await this.git.clone(url, targetDir, args);
  }

  async pull(): Promise<void> {
    await this.git.pull();
  }

  async getCurrentBranch(): Promise<string> {
    const branches = await this.git.branch();
    return branches.current || 'main';
  }

  async getRemoteUrl(): Promise<string | null> {
    try {
      const remotes = await this.git.getRemotes(true);
      const origin = remotes.find(r => r.name === 'origin');
      return origin?.refs.fetch || null;
    } catch {
      return null;
    }
  }

  async getLatestCommit(): Promise<string> {
    const log = await this.git.log({ maxCount: 1 });
    return log.latest?.hash || '';
  }

  async hasUpdates(): Promise<boolean> {
    try {
      await this.git.fetch();
      const status = await this.git.status();
      return status.behind > 0;
    } catch {
      return false;
    }
  }
}

export function createGitHelper(baseDir?: string): GitHelper {
  return new GitHelper(baseDir);
}
