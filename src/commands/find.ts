import * as readline from 'readline';
import { Command } from 'commander';
import { createAddCommand } from './add';
import { logger } from '../utils/logger';

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[38;5;102m';
const TEXT = '\x1b[38;5;145m';
const CYAN = '\x1b[36m';
const MAGENTA = '\x1b[35m';
const YELLOW = '\x1b[33m';

const SEARCH_API_BASE = process.env.SKILLS_API_URL || 'https://skills.sh';

export interface SearchSkill {
  name: string;
  slug: string;
  source: string;
  installs: number;
}

export async function searchSkillsAPI(query: string): Promise<SearchSkill[]> {
  try {
    const url = `${SEARCH_API_BASE}/api/search?q=${encodeURIComponent(query)}&limit=10`;
    const res = await fetch(url);

    if (!res.ok) return [];

    const data = (await res.json()) as {
      skills: Array<{
        id: string;
        name: string;
        installs: number;
        source: string;
      }>;
    };

    return data.skills.map((skill) => ({
      name: skill.name,
      slug: skill.id,
      source: skill.source || '',
      installs: skill.installs,
    }));
  } catch {
    return [];
  }
}

const HIDE_CURSOR = '\x1b[?25l';
const SHOW_CURSOR = '\x1b[?25h';
const CLEAR_DOWN = '\x1b[J';
const MOVE_UP = (n: number) => `\x1b[${n}A`;
const MOVE_TO_COL = (n: number) => `\x1b[${n}G`;

async function runSearchPrompt(initialQuery = ''): Promise<SearchSkill | null> {
  let results: SearchSkill[] = [];
  let selectedIndex = 0;
  let query = initialQuery;
  let loading = false;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let lastRenderedLines = 0;

  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }

  readline.emitKeypressEvents(process.stdin);
  process.stdin.resume();
  process.stdout.write(HIDE_CURSOR);

  function render(): void {
    if (lastRenderedLines > 0) {
      process.stdout.write(MOVE_UP(lastRenderedLines) + MOVE_TO_COL(1));
    }

    process.stdout.write(CLEAR_DOWN);

    const lines: string[] = [];

    const cursor = `${BOLD}_${RESET}`;
    lines.push(`${TEXT}Search skills:${RESET} ${query}${cursor}`);
    lines.push('');

    if (!query || query.length < 2) {
      lines.push(`${DIM}Start typing to search (min 2 chars)${RESET}`);
    } else if (results.length === 0 && loading) {
      lines.push(`${DIM}Searching...${RESET}`);
    } else if (results.length === 0) {
      lines.push(`${DIM}No skills found${RESET}`);
    } else {
      const maxVisible = 8;
      const visible = results.slice(0, maxVisible);

      for (let i = 0; i < visible.length; i++) {
        const skill = visible[i]!;
        const isSelected = i === selectedIndex;
        const arrow = isSelected ? `${BOLD}>${RESET}` : ' ';
        const name = isSelected ? `${BOLD}${skill.name}${RESET}` : `${TEXT}${skill.name}${RESET}`;
        const source = skill.source ? ` ${DIM}${skill.source}${RESET}` : '';
        const loadingIndicator = loading && i === 0 ? ` ${DIM}...${RESET}` : '';

        lines.push(` ${arrow} ${name}${source}${loadingIndicator}`);
      }
    }

    lines.push('');
    lines.push(`${DIM}up/down navigate | enter select | esc cancel${RESET}`);

    for (const line of lines) {
      process.stdout.write(line + '\n');
    }

    lastRenderedLines = lines.length;
  }

  function triggerSearch(q: string): void {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }

    loading = false;

    if (!q || q.length < 2) {
      results = [];
      selectedIndex = 0;
      render();
      return;
    }

    loading = true;
    render();

    const debounceMs = Math.max(150, 350 - q.length * 50);

    debounceTimer = setTimeout(async () => {
      try {
        results = await searchSkillsAPI(q);
        selectedIndex = 0;
      } catch {
        results = [];
      } finally {
        loading = false;
        debounceTimer = null;
        render();
      }
    }, debounceMs);
  }

  if (initialQuery) {
    triggerSearch(initialQuery);
  }
  render();

  return new Promise((resolve) => {
    function cleanup(): void {
      process.stdin.removeListener('keypress', handleKeypress);
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(false);
      }
      process.stdout.write(SHOW_CURSOR);
      process.stdin.pause();
    }

    function handleKeypress(_ch: string | undefined, key: readline.Key): void {
      if (!key) return;

      if (key.name === 'escape' || (key.ctrl && key.name === 'c')) {
        cleanup();
        resolve(null);
        return;
      }

      if (key.name === 'return') {
        cleanup();
        resolve(results[selectedIndex] || null);
        return;
      }

      if (key.name === 'up') {
        selectedIndex = Math.max(0, selectedIndex - 1);
        render();
        return;
      }

      if (key.name === 'down') {
        selectedIndex = Math.min(Math.max(0, results.length - 1), selectedIndex + 1);
        render();
        return;
      }

      if (key.name === 'backspace') {
        if (query.length > 0) {
          query = query.slice(0, -1);
          triggerSearch(query);
        }
        return;
      }

      if (key.sequence && !key.ctrl && !key.meta && key.sequence.length === 1) {
        const char = key.sequence;
        if (char >= ' ' && char <= '~') {
          query += char;
          triggerSearch(query);
        }
      }
    }

    process.stdin.on('keypress', handleKeypress);
  });
}

function getOwnerRepoFromString(pkg: string): { owner: string; repo: string } | null {
  const atIndex = pkg.lastIndexOf('@');
  const repoPath = atIndex > 0 ? pkg.slice(0, atIndex) : pkg;
  const match = repoPath.match(/^([^/]+)\/([^/]+)$/);
  if (match) {
    return { owner: match[1]!, repo: match[2]! };
  }
  return null;
}

export async function runFind(args: string[]): Promise<void> {
  const query = args.join(' ');
  const isNonInteractive = !process.stdin.isTTY;
  const agentTip = `${DIM}Tip: if running in a coding agent, follow these steps:${RESET}
${DIM} 1) npx iskill find [query]${RESET}
${DIM} 2) npx iskill add <owner/repo@skill>${RESET}`;

  if (query) {
    const results = await searchSkillsAPI(query);

    if (results.length === 0) {
      console.log(`${DIM}No skills found for "${query}"${RESET}`);
      return;
    }

    console.log(`${DIM}Install with${RESET} npx iskill add <owner/repo@skill>`);
    console.log();

    for (const skill of results.slice(0, 6)) {
      const pkg = skill.source || skill.slug;
      console.log(`${TEXT}${pkg}@${skill.name}${RESET}`);
      console.log(`${DIM}└ https://skills.sh/${skill.slug}${RESET}`);
      console.log();
    }
    return;
  }

  if (isNonInteractive) {
    console.log(agentTip);
    console.log();
  }

  const selected = await runSearchPrompt();

  if (!selected) {
    console.log(`${DIM}Search cancelled${RESET}`);
    console.log();
    return;
  }

  const pkg = selected.source || selected.slug;
  const skillName = selected.name;

  console.log();
  console.log(`${TEXT}Installing ${BOLD}${skillName}${RESET} from ${DIM}${pkg}${RESET}...`);
  console.log();

  const { Command } = await import('commander');
  const program = new Command();
  const addCommand = createAddCommand();
  program.addCommand(addCommand);

  await program.parseAsync(['node', 'iskill', 'add', pkg, '--skill', skillName]);

  console.log();

  const info = getOwnerRepoFromString(pkg);
  if (info) {
    console.log(
      `${DIM}View the skill at${RESET} ${TEXT}https://skills.sh/${selected.slug}${RESET}`
    );
  } else {
    console.log(`${DIM}Discover more skills at${RESET} ${TEXT}https://skills.sh${RESET}`);
  }

  console.log();
}

export function createFindCommand(): Command {
  return new Command('find')
    .alias('search')
    .description('Search for skills interactively or by keyword')
    .argument('[query...]', 'Search keyword (optional for interactive mode)')
    .action(async (query: string[]) => {
      try {
        await runFind(query);
      } catch (error) {
        logger.error(`Search failed: ${error}`);
        process.exit(1);
      }
    });
}
