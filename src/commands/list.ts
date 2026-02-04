import { Command } from 'commander';
import { createPathManager } from '../core/path-manager';
import { createScanner } from '../core/scanner';
import { logger } from '../utils/logger';

export function createListCommand(): any {
  const command = new Command('list')
    .alias('ls')
    .description('List installed skills in a specified path')
    .requiredOption('-p, --path <path>', 'Path to list skills from')
    .action(async (options: any) => {
      try {
        const pathManager = createPathManager();
        const scanner = createScanner();

        const resolvedPath = pathManager.resolvePath(options.path);
        const skills = await scanner.scan(resolvedPath);

        if (skills.length === 0) {
          logger.info(`No skills found in ${resolvedPath}`);
          return;
        }

        logger.plain(`\nSkills in ${resolvedPath}:`);
        logger.plain('─'.repeat(80));

        for (const skill of skills) {
          logger.plain(`  • ${skill.name}`);
          logger.plain(`    ${skill.description}`);
          if (skill.version) {
            logger.plain(`    Version: ${skill.version}`);
          }
          logger.plain('');
        }

        logger.plain(`Total: ${skills.length} skill(s)`);
      } catch (error) {
        logger.error(`Failed to list skills: ${error}`);
        process.exit(1);
      }
    });

  return command;
}
