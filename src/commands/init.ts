import { Command } from 'commander';
import * as path from 'path';
import { writeFile, ensureDir } from '../utils/file';
import { logger } from '../utils/logger';

const SKILL_TEMPLATE = `---
name: {{name}}
description: A brief description of what this skill does
---

# {{name}}

A detailed description of this skill.

## When to Use

Describe the scenarios where this skill should be used.

## Steps

1. First step
2. Second step
3. Third step

## Notes

Any additional notes or context for using this skill.
`;

export function createInitCommand(): any {
  const command = new Command('init')
    .description('Create a new skill template')
    .argument('[name]', 'Skill name (optional)')
    .action(async (name: string | undefined) => {
      try {
        const skillName = name || 'my-skill';
        const skillDir = skillName.includes('/') ? skillName : path.join('.', skillName);
        const skillFile = path.join(skillDir, 'SKILL.md');

        const exists = await fileExists(skillFile);
        if (exists) {
          logger.warn(`SKILL.md already exists at ${skillFile}`);
          return;
        }

        const content = SKILL_TEMPLATE.replace(/\{\{name\}\}/g, skillName.split('/').pop() || skillName);
        
        await ensureDir(skillDir);
        await writeFile(skillFile, content);

        logger.success(`Created skill template at ${skillFile}`);
        logger.plain(`\nEdit ${skillFile} to customize your skill.`);
      } catch (error) {
        logger.error(`Failed to create skill template: ${error}`);
        process.exit(1);
      }
    });

  return command;
}

async function fileExists(filePath: string): Promise<boolean> {
  const fs = await import('fs-extra');
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
