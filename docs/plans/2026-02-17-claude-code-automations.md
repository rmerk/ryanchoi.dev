# Claude Code Automations Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Set up Claude Code automations (MCP server, hooks, and skills) for the ryanchoi.dev portfolio site.

**Architecture:** Configure `.claude/settings.json` for hooks, create skill files under `.claude/skills/`, and add context7 MCP server via `.mcp.json`. No application code changes — this is all Claude Code tooling configuration.

**Tech Stack:** Claude Code settings (JSON), MCP servers (context7), Skill files (Markdown with YAML frontmatter)

---

### Task 1: Install context7 MCP Server

**Why:** Gives Claude live documentation lookup for Astro 5 and Tailwind CSS v4 instead of relying on potentially outdated training data.

**Files:**
- Create: `.mcp.json`

**Step 1: Create `.mcp.json` at the project root**

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    }
  }
}
```

This file is checked into the repo so any team member (or future you) gets the same MCP server automatically.

**Step 2: Verify the MCP server is recognized**

Run: `claude mcp list`
Expected: `context7` appears in the list.

**Step 3: Commit**

```bash
git add .mcp.json
git commit -m "chore: add context7 MCP server for live docs lookup"
```

---

### Task 2: Create `.claude/settings.json` with Hooks

**Why:** Two hooks — (1) run `astro check` after file edits to catch TypeScript errors immediately, and (2) block accidental edits to `deploy.sh` which rsyncs to production.

**Files:**
- Create: `.claude/settings.json`

**Step 1: Create `.claude/settings.json`**

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "command": "case \"$CLAUDE_FILE_PATH\" in */deploy.sh) echo 'BLOCK: deploy.sh is protected — edit it manually' >&2; exit 2;; esac"
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "command": "cd /Users/rchoi/Personal/ryanchoi-dev && npx astro check 2>&1 | tail -10"
      }
    ]
  }
}
```

Notes:
- `PreToolUse` with exit code 2 blocks the tool call and shows the message.
- `PostToolUse` runs `astro check` after every Edit/Write so type errors surface immediately.
- The `$CLAUDE_FILE_PATH` env var is set by Claude Code for Edit/Write hooks.

**Step 2: Verify the deploy.sh protection hook**

In Claude Code, ask Claude to edit `deploy.sh`. It should be blocked with the message "BLOCK: deploy.sh is protected".

**Step 3: Verify the astro check hook**

In Claude Code, ask Claude to edit any `.astro` file (e.g., add a harmless comment). After the edit, `astro check` output should appear automatically.

**Step 4: Commit**

```bash
git add .claude/settings.json
git commit -m "chore: add Claude Code hooks for astro check and deploy.sh protection"
```

---

### Task 3: Create the `deploy` Skill

**Why:** Wraps `./deploy.sh` so you can type `/deploy` in Claude Code to build and deploy to the VPS with confirmation.

**Files:**
- Create: `.claude/skills/deploy/SKILL.md`

**Step 1: Create the skill directory and file**

Create `.claude/skills/deploy/SKILL.md`:

```markdown
---
name: deploy
description: Build the Astro site and deploy to VPS via rsync
disable-model-invocation: true
---

# Deploy to Production

Build the site and deploy to the Vultr VPS.

## Steps

1. Run `pnpm build` and confirm it succeeds with no errors.
2. Show the user the build output summary (page count, bundle size).
3. Ask the user to confirm deployment to production (the VPS).
4. Only after explicit confirmation, run `./deploy.sh` from the project root.
5. Report the rsync output to the user.

## Important

- NEVER deploy without explicit user confirmation.
- If `pnpm build` fails, stop and show the errors — do not deploy.
- The deploy script rsyncs `dist/` to `/var/www/html/` on the VPS with `--delete`, meaning files not in `dist/` will be removed from the server.
```

**Step 2: Verify the skill appears**

Run: `claude` and type `/deploy`
Expected: The skill is listed and can be invoked.

**Step 3: Commit**

```bash
git add .claude/skills/deploy/SKILL.md
git commit -m "chore: add /deploy skill for VPS deployment"
```

---

### Task 4: Create the `new-post` Skill

**Why:** Scaffolds a new blog post with correct frontmatter matching the Zod schema in `src/content.config.ts`, so you don't have to remember the schema each time.

**Files:**
- Create: `.claude/skills/new-post/SKILL.md`

**Step 1: Create the skill directory and file**

Create `.claude/skills/new-post/SKILL.md`:

```markdown
---
name: new-post
description: Scaffold a new blog post with correct frontmatter
disable-model-invocation: true
---

# New Blog Post

Create a new blog post file in `src/content/blog/`.

## Arguments

The user provides a title. If not provided, ask for one.

## Steps

1. Take the title and generate a URL-friendly slug (lowercase, hyphens, no special chars).
2. Create `src/content/blog/<slug>.md` with this frontmatter:

```yaml
---
title: <Title>
date: <today's date as YYYY-MM-DD>
tags: []
draft: true
description:
---
```

3. Leave the body empty after the frontmatter closing `---`.
4. Tell the user the file was created and remind them to:
   - Add tags (array of strings)
   - Write a description (optional but recommended)
   - Set `draft: false` when ready to publish

## Schema Reference

From `src/content.config.ts`, the blog schema is:
- `title`: string (required)
- `date`: date (required, coerced)
- `tags`: string[] (defaults to `[]`)
- `draft`: boolean (defaults to `false`)
- `description`: string (optional)

## Important

- Always set `draft: true` for new posts so they don't accidentally publish.
- Use today's date (YYYY-MM-DD format).
- The slug should match the filename exactly.
```

**Step 2: Verify the skill appears**

Run: `claude` and type `/new-post`
Expected: The skill is listed and can be invoked.

**Step 3: Commit**

```bash
git add .claude/skills/new-post/SKILL.md
git commit -m "chore: add /new-post skill for blog post scaffolding"
```

---

### Task 5: Update CLAUDE.md with Automation Documentation

**Why:** Document the new automations so future sessions know they exist.

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Add a section to CLAUDE.md after the "Conventions" section**

Append this to the end of `CLAUDE.md`:

```markdown

## Claude Code Automations

### MCP Servers
- **context7**: Live documentation lookup for Astro, Tailwind, and other libraries. Configured in `.mcp.json`.

### Hooks (`.claude/settings.json`)
- **PreToolUse**: Blocks edits to `deploy.sh` — edit it manually to avoid accidental production changes.
- **PostToolUse**: Runs `astro check` after every file edit to catch TypeScript errors immediately.

### Skills
- `/deploy` — Build and deploy to VPS with confirmation. User-invoked only.
- `/new-post <title>` — Scaffold a new blog post with correct frontmatter. User-invoked only.
```

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: document Claude Code automations in CLAUDE.md"
```
