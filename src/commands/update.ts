import { Command } from 'commander';
import { createPathManager } from '../core/path-manager';
import { createInstaller } from '../core/installer';
import { logger } from '../utils/logger';

export function createUpdateCommand(): any {
  const command = new Command('update')
    .description('Update installed skills to their latest versions')
    .requiredOption('-p, --path <path>', 'Path to update skills in')
    .action(async (options: any) => {
      try {
        const pathManager = createPathManager();
        const installer = createInstaller();

        const resolvedPath = pathManager.resolvePath(options.path);
        
        logger.info(`Updating skills in ${resolvedPath}`);
        
        await installer.updateAll(resolvedPath);
        
        logger.success('Update completed successfully');
      } catch (error) {
        logger.error(`Update failed: ${error}`);
        process.exit(1);
      }
    });

  return command;
}
