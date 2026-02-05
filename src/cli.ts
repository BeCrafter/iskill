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

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[38;5;102m';
const TEXT = '\x1b[38;5;145m';

const LOGO_LINES = [
  '██╗███████╗██╗  ██╗██╗██╗     ██╗     ',
  '██║██╔════╝██║ ██╔╝██║██║     ██║     ',
  '██║███████╗█████╔╝ ██║██║     ██║     ',
  '██║╚════██║██╔═██╗ ██║██║     ██║     ',
  '██║███████║██║  ██╗██║███████╗███████╗',
  '╚═╝╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝',
];

const GRAYS = [
  '\x1b[38;5;250m',
  '\x1b[38;5;248m',
  '\x1b[38;5;245m',
  '\x1b[38;5;243m',
  '\x1b[38;5;240m',
  '\x1b[38;5;238m',
];

function showLogo(): void {
  console.log();
  LOGO_LINES.forEach((line, i) => {
    console.log(`${GRAYS[i]}${line}${RESET}`);
  });
}

function showBanner(): void {
  showLogo();
  console.log();
  console.log(`${DIM}The flexible skill installation tool${RESET}`);
  console.log();
  console.log(
    ` ${DIM}$${RESET} ${TEXT}npx iskill add${RESET} ${DIM}<package>${RESET} ${DIM}Install a skill${RESET}`
  );
  console.log(
    ` ${DIM}$${RESET} ${TEXT}npx iskill list${RESET} ${DIM}List installed skills${RESET}`
  );
  console.log(
    ` ${DIM}$${RESET} ${TEXT}npx iskill find${RESET} ${DIM}[query]${RESET} ${DIM}Search for skills${RESET}`
  );
  console.log(
    ` ${DIM}$${RESET} ${TEXT}npx iskill remove${RESET} ${DIM}Remove installed skills${RESET}`
  );
  console.log(
    ` ${DIM}$${RESET} ${TEXT}npx iskill check${RESET} ${DIM}Check for updates${RESET}`
  );
  console.log(
    ` ${DIM}$${RESET} ${TEXT}npx iskill update${RESET} ${DIM}Update all skills${RESET}`
  );
  console.log(
    ` ${DIM}$${RESET} ${TEXT}npx iskill init${RESET} ${DIM}[name]${RESET} ${DIM}Create a new skill${RESET}`
  );
  console.log();
  console.log(`${DIM}try:${RESET} npx iskill add vercel-labs/agent-skills`);
  console.log();
  console.log(`Discover more skills at ${TEXT}https://skills.sh/${RESET}`);
  console.log();
}

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

const args = process.argv.slice(2);

if (args.length === 0) {
  showBanner();
} else {
  program.parse(process.argv);
}
