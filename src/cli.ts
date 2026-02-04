#!/usr/bin/env node

import { Command } from 'commander';
import { createAddCommand } from './commands/add';
import { createListCommand } from './commands/list';
import { createFindCommand } from './commands/find';
import { createRemoveCommand } from './commands/remove';
import { createCheckCommand } from './commands/check';
import { createUpdateCommand } from './commands/update';
import { createInitCommand } from './commands/init';
import { logger } from './utils/logger';

const program = new Command();

program
  .name('iskill')
  .description('A flexible skill installation tool with custom path support')
  .version('1.0.0');

program.addCommand(createAddCommand());
program.addCommand(createListCommand());
program.addCommand(createFindCommand());
program.addCommand(createRemoveCommand());
program.addCommand(createCheckCommand());
program.addCommand(createUpdateCommand());
program.addCommand(createInitCommand());

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
