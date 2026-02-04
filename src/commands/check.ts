import { Command } from 'commander';
import { createPathManager } from '../core/path-manager';
import { createInstaller } from '../core/installer';
import { logger } from '../utils/logger';

export function createCheckCommand(): any {
  const command = new Command('check')
    .description('Check for available skill updates')
    .requiredOption('-p, --path <path>', 'Path to check for updates')
    .action(async (options: any) => {
      try {
        const pathManager = createPathManager();
        const installer = createInstaller();

        const resolvedPath = pathManager.resolvePath(options.path);
        
        logger.info(`Checking for updates in ${resolvedPath}`);
        
        const updates = await installer.checkUpdates(resolvedPath);
        
        let updateCount = 0;
        for (const [skillName, hasUpdate] of updates.entries()) {
          if (hasUpdate) {
            updateCount++;
            logger.plain(`  • ${skillName}: Update available`);
          } else {
            logger.plain(`  • ${skillName}: Up to date`);
          }
        }

        if (updateCount === 0) {
          logger.success('All skills are up to date');
        } else {
          logger.info(`Found ${updateCount} skill(s) with updates`);
          logger.plain('Run "iskill update" to install updates');
        }
      } catch (error) {
        logger.error(`Check failed: ${error}`);
        process.exit(1);
      }
    });

  return command;
}
