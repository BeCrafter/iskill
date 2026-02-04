# iskill

A flexible skill installation tool with custom path support. iskill allows you to install, manage, and organize agent skills from various sources to any directory you specify.

## Features

- **Flexible Path Management**: Install skills to any custom path
- **Multiple Source Formats**: Support for GitHub shorthand, URLs, Git repositories, and local paths
- **Installation Methods**: Choose between symlink (recommended) or copy installation
- **Skill Management**: List, search, install, update, and remove skills
- **Skills Compatibility**: Fully compatible with the [Agent Skills specification](https://agentskills.io)
- **Configuration Support**: Project and global configuration files

## Installation

```bash
npm install -g iskill
```

Or use without installation:

```bash
npx iskill <command>
```

## Quick Start

### Install Skills

Install skills from a GitHub repository to a custom path:

```bash
iskill add vercel-labs/agent-skills --path ./my-skills
```

Install specific skills:

```bash
iskill add vercel-labs/agent-skills --path ./my-skills --skill frontend-design
```

List available skills without installing:

```bash
iskill add vercel-labs/agent-skills --list
```

### List Installed Skills

```bash
iskill list --path ./my-skills
```

### Search Skills

Search interactively:

```bash
iskill find
```

Search by keyword:

```bash
iskill find typescript
```

### Remove Skills

Remove a specific skill:

```bash
iskill remove frontend-design --path ./my-skills
```

Remove all skills:

```bash
iskill remove --all --path ./my-skills
```

### Update Skills

Check for updates:

```bash
iskill check --path ./my-skills
```

Update all skills:

```bash
iskill update --path ./my-skills
```

### Create a New Skill

```bash
iskill init my-skill
```

## Commands

### `iskill add` / `iskill install`

Install skills from a source to a specified path.

```bash
iskill add <source> [options]
```

**Arguments:**
- `<source>`: Skill source (GitHub shorthand, URL, or local path)

**Options:**
- `-p, --path <path>`: Target installation path (required)
- `-s, --skill <skills...>`: Install specific skills (use `*` for all)
- `-l, --list`: List available skills without installing
- `-y, --yes`: Skip confirmation prompts
- `-m, --method <method>`: Installation method: `symlink` or `copy` (default: `symlink`)

**Examples:**

```bash
# Install all skills from a repository
iskill add vercel-labs/agent-skills --path ./skills

# Install specific skills
iskill add vercel-labs/agent-skills --path ./skills --skill frontend-design backend-helper

# List available skills
iskill add vercel-labs/agent-skills --list

# Use copy method instead of symlink
iskill add vercel-labs/agent-skills --path ./skills --method copy

# Install from local path
iskill add ./local-skills --path ./installed-skills --method copy
```

### `iskill list` / `iskill ls`

List installed skills in a specified path.

```bash
iskill list [options]
```

**Options:**
- `-p, --path <path>`: Path to list skills from (required)

**Example:**

```bash
iskill list --path ./skills
```

### `iskill find` / `iskill search`

Search for skills interactively or by keyword.

```bash
iskill find [query]
```

**Arguments:**
- `[query]`: Search keyword (optional for interactive mode)

**Examples:**

```bash
# Interactive search
iskill find

# Search by keyword
iskill find typescript
```

### `iskill remove` / `iskill rm`

Remove installed skills from a specified path.

```bash
iskill remove [skills...] [options]
```

**Arguments:**
- `[skills...]`: Skills to remove (optional if using `--all`)

**Options:**
- `-p, --path <path>`: Path to remove skills from (required)
- `-s, --skill <skills...>`: Specify skills to remove
- `-y, --yes`: Skip confirmation prompts
- `--all`: Remove all skills

**Examples:**

```bash
# Remove specific skill
iskill remove frontend-design --path ./skills

# Remove multiple skills
iskill remove frontend-design backend-helper --path ./skills

# Remove all skills
iskill remove --all --path ./skills
```

### `iskill check`

Check for available skill updates.

```bash
iskill check [options]
```

**Options:**
- `-p, --path <path>`: Path to check for updates (required)

**Example:**

```bash
iskill check --path ./skills
```

### `iskill update`

Update installed skills to their latest versions.

```bash
iskill update [options]
```

**Options:**
- `-p, --path <path>`: Path to update skills in (required)

**Example:**

```bash
iskill update --path ./skills
```

### `iskill init`

Create a new skill template.

```bash
iskill init [name]
```

**Arguments:**
- `[name]`: Skill name (optional)

**Examples:**

```bash
# Create skill in current directory
iskill init

# Create skill in subdirectory
iskill init my-skill
```

## Source Formats

### GitHub Shorthand

```bash
iskill add vercel-labs/agent-skills --path ./skills
```

### Full GitHub URL

```bash
iskill add https://github.com/vercel-labs/agent-skills --path ./skills
```

### Direct Path to Skill

```bash
iskill add https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines --path ./skills
```

### GitLab URL

```bash
iskill add https://gitlab.com/org/repo --path ./skills
```

### Git URL

```bash
iskill add git@github.com:vercel-labs/agent-skills.git --path ./skills
```

### Local Path

```bash
iskill add ./local-skills --path ./installed-skills --method copy
```

## Installation Methods

### Symlink (Recommended)

Creates symbolic links to the skill source. This is the default method and provides:

- Single source of truth
- Easy updates
- Minimal disk space usage

```bash
iskill add vercel-labs/agent-skills --path ./skills --method symlink
```

### Copy

Creates independent copies of each skill. Use when:

- Symlinks aren't supported
- You need offline copies
- You want to modify skills independently

```bash
iskill add vercel-labs/agent-skills --path ./skills --method copy
```

## Configuration

### Configuration Files

iskill supports both project-level and global configuration files.

#### Project Configuration

Create `.iskillrc.json` in your project root:

```json
{
  "defaultPath": "./skills",
  "paths": ["./skills", "./custom-skills"],
  "installMethod": "symlink",
  "autoUpdate": false,
  "telemetry": false
}
```

#### Global Configuration

Create `~/.iskill/config.json`:

```json
{
  "defaultPath": "~/skills",
  "paths": [],
  "installMethod": "symlink",
  "autoUpdate": false,
  "telemetry": true
}
```

### Configuration Options

| Option | Type | Description | Default |
|--------|--------|-------------|----------|
| `defaultPath` | string | Default installation path | `"./skills"` |
| `paths` | string[] | Multiple skill paths | `[]` |
| `installMethod` | string | Default installation method (symlink/copy) | `"symlink"` |
| `autoUpdate` | boolean | Whether to automatically check for updates | `false` |
| `telemetry` | boolean | Whether to enable telemetry | `true` |

### Configuration Priority

1. Command line arguments (highest priority)
2. Project-level configuration
3. Global-level configuration
4. Default values (lowest priority)

## Skill Format

Skills are defined in `SKILL.md` files with YAML frontmatter:

```markdown
---
name: my-skill
description: What this skill does and when to use it
---

# My Skill

Instructions for the agent to follow when this skill is activated.

## When to Use

Describe the scenarios where this skill should be used.

## Steps

1. First, do this
2. Then, do that
```

### Required Fields

- `name`: Unique identifier (lowercase, hyphens allowed)
- `description`: Brief explanation of what the skill does

### Optional Fields

- `version`: Skill version
- `metadata.internal`: Set to `true` to hide from normal discovery

## Skill Discovery

iskill searches for skills in these locations within a repository:

- Root directory (if it contains `SKILL.md`)
- `skills/`
- `skills/.curated/`
- `skills/.experimental/`
- `skills/.system/`
- `.agents/skills/`
- `.agent/skills/`
- `.claude/skills/`
- And many more agent-specific directories

## Troubleshooting

### "No skills found"

Ensure the repository contains valid `SKILL.md` files with both `name` and `description` in the frontmatter.

### Permission errors

Ensure you have write access to the target directory.

### Symlink creation fails

On Windows, you may need to enable Developer Mode or run as administrator. Alternatively, use the `--method copy` option.

### Git clone fails

Ensure you have git installed and have network access to the repository.

## Environment Variables

| Variable | Description |
|-----------|-------------|
| `DISABLE_TELEMETRY` | Disable anonymous usage telemetry |
| `DO_NOT_TRACK` | Alternative way to disable telemetry |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Related Links

- [Agent Skills Specification](https://agentskills.io)
- [Skills Directory](https://skills.sh)
- [Vercel Agent Skills Repository](https://github.com/vercel-labs/agent-skills)

## Acknowledgments

This project is inspired by and compatible with the [skills](https://github.com/vercel-labs/skills) CLI tool.

## Deployment

This project uses GitHub Actions for automated CI/CD:

### CI Pipeline

Continuous Integration runs on:
- Push to `main` or `develop` branches
- Pull Requests targeting `main` or `develop`

The CI pipeline:
- Runs tests across Node.js versions 18.x, 20.x, and 21.x
- Executes linting and type checking
- Builds the project

### Automated Releases

Releases are automated via GitHub Actions:

```bash
# Patch release (1.0.0 -> 1.0.1)
npm run release:patch

# Minor release (1.0.0 -> 1.1.0)
npm run release:minor

# Major release (1.0.0 -> 2.0.0)
npm run release:major
```

These commands will:
1. Update the version in `package.json`
2. Commit the version change
3. Push to GitHub
4. Trigger the release workflow
5. Publish to npm
6. Create a GitHub Release

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

### Manual Release

To manually trigger a release:

```bash
# Update version
npm version 1.0.1

# Create and push tag
git tag v1.0.1
git push origin v1.0.1
```

This will automatically trigger the release workflow.
