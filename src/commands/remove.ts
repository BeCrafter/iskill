import { Command } from 'commander';
import { createPathManager } from '../core/path-manager';
import { createInstaller } from '../core/installer';
import { createScanner } from '../core/scanner';
import { logger } from '../utils/logger';

export function createRemoveCommand(): any {
  const command = new Command('remove')
    .alias('rm')
    .description('Remove installed skills from a specified path')
    .argument('[skills...]', 'Skills to remove (optional if using --all)')
    .requiredOption('-p, --path <path>', 'Path to remove skills from')
    .option('-s, --skill <skills...>', 'Specify skills to remove')
    .option('-y, --yes', 'Skip confirmation prompts')
    .option('--all', 'Remove all skills')
    .action(async (skills: string[], options: any) => {
      try {
        const pathManager = createPathManager();
        const installer = createInstaller();
        const scanner = createScanner();

        const resolvedPath = pathManager.resolvePath(options.path);

        if (options.all) {
          const allSkills = await scanner.scan(resolvedPath);
          logger.info(`Removing ${allSkills.length} skill(s) from ${resolvedPath}`);
          
          for (const skill of allSkills) {
            await installer.uninstall(skill.name, resolvedPath);
          }
          
          logger.success(`Removed ${allSkills.length} skill(s)`);
          return;
        }

        const skillsToRemove = options.skill || skills;

        if (!skillsToRemove || skillsToRemove.length === 0) {
          logger.error('No skills specified. Use --skill or provide skill names as arguments.');
          process.exit(1);
        }

        for (const skillName of skillsToRemove) {
          await installer.uninstall(skillName, resolvedPath);
        }

        logger.success(`Removed ${skillsToRemove.length} skill(s)`);
      } catch (error) {
        logger.error(`Removal failed: ${error}`);
        process.exit(1);
      }
    });

  return command;
}
