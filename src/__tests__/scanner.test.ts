import { Scanner } from '../core/scanner';
import * as path from 'path';
import * as fs from 'fs-extra';

describe('Scanner', () => {
  let scanner: Scanner;
  let testDir: string;

  beforeEach(() => {
    scanner = new Scanner();
    testDir = path.join(__dirname, 'test-skills');
  });

  afterEach(async () => {
    await fs.remove(testDir);
  });

  describe('parseSkill', () => {
    it('should parse valid skill file', async () => {
      const skillDir = path.join(testDir, 'valid-skill');
      await fs.ensureDir(skillDir);
      
      const skillContent = `---
name: test-skill
description: A test skill
---

# Test Skill

This is a test skill.
`;
      await fs.writeFile(path.join(skillDir, 'SKILL.md'), skillContent);

      const skill = await scanner.parseSkill(skillDir);
      
      expect(skill).not.toBeNull();
      expect(skill?.name).toBe('test-skill');
      expect(skill?.description).toBe('A test skill');
    });

    it('should return null for missing skill file', async () => {
      const skillDir = path.join(testDir, 'no-skill');
      await fs.ensureDir(skillDir);

      const skill = await scanner.parseSkill(skillDir);
      
      expect(skill).toBeNull();
    });

    it('should return null for invalid frontmatter', async () => {
      const skillDir = path.join(testDir, 'invalid-skill');
      await fs.ensureDir(skillDir);
      
      const skillContent = `---
description: A test skill
---

# Test Skill`;
      await fs.writeFile(path.join(skillDir, 'SKILL.md'), skillContent);

      const skill = await scanner.parseSkill(skillDir);
      
      expect(skill).toBeNull();
    });
  });

  describe('findSkillFile', () => {
    it('should find SKILL.md in directory', async () => {
      const skillDir = path.join(testDir, 'has-skill');
      await fs.ensureDir(skillDir);
      await fs.writeFile(path.join(skillDir, 'SKILL.md'), 'test');

      const skillFile = await scanner.findSkillFile(skillDir);
      
      expect(skillFile).toContain('SKILL.md');
    });

    it('should return null when SKILL.md not found', async () => {
      const skillDir = path.join(testDir, 'no-skill');
      await fs.ensureDir(skillDir);

      const skillFile = await scanner.findSkillFile(skillDir);
      
      expect(skillFile).toBeNull();
    });
  });

  describe('scan', () => {
    it('should scan directory and find skills', async () => {
      const skill1Dir = path.join(testDir, 'skill1');
      const skill2Dir = path.join(testDir, 'skill2');
      
      await fs.ensureDir(skill1Dir);
      await fs.ensureDir(skill2Dir);
      
      await fs.writeFile(path.join(skill1Dir, 'SKILL.md'), `---
name: skill1
description: First skill
---`);
      await fs.writeFile(path.join(skill2Dir, 'SKILL.md'), `---
name: skill2
description: Second skill
---`);

      const skills = await scanner.scan(testDir);
      
      expect(skills).toHaveLength(2);
      expect(skills[0].name).toBe('skill1');
      expect(skills[1].name).toBe('skill2');
    });

    it('should return empty array for non-existent path', async () => {
      const nonExistent = path.join(testDir, 'non-existent');
      const skills = await scanner.scan(nonExistent);
      
      expect(skills).toHaveLength(0);
    });
  });
});
