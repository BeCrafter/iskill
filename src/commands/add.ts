import { Command } from 'commander';
import { createPathManager } from '../core/path-manager';
import { createInstaller } from '../core/installer';
import { createResolver } from '../core/resolver';
import { InstallOptions } from '../types';
import { logger } from '../utils/logger';

export function createAddCommand(): Command {
  const command = new Command('add')
    .alias('install')
    .description('Install skills from a source to a specified path')
    .argument('<source>', 'Skill source (GitHub shorthand, URL, or local path)')
    .requiredOption('-p, --path <path>', 'Target installation path')
    .option('-s, --skill <skills...>', 'Install specific skills (use "*" for all)')
    .option('-l, --list', 'List available skills without installing')
    .option('-y, --yes', 'Skip confirmation prompts')
    .option('-m, --method <method>', 'Installation method: symlink or copy', 'symlink')
    .action(async (source: string, options: any) => {
      try {
        const installOptions: InstallOptions = {
          skills: options.skill,
          list: options.list,
          yes: options.yes,
          method: options.method
        };

        const pathManager = createPathManager();
        const installer = createInstaller();

        logger.info(`Installing skills from ${source} to ${options.path}`);
        
        await installer.install(source, options.path, installOptions);
        
        if (!options.list) {
          logger.success('Installation completed successfully');
        }
      } catch (error) {
        logger.error(`Installation failed: ${error}`);
        process.exit(1);
      }
    });

  return command;
}
