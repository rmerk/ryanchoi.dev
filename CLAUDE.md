# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio and blog for Ryan Choi (`ryanchoi.dev`). A static site built with Astro 5, Tailwind CSS v4, and TypeScript. Deployed to a Vultr VPS via rsync.

## Commands

```bash
pnpm dev          # Dev server at localhost:4321
pnpm build        # Build static site to ./dist/
pnpm preview      # Preview production build locally
pnpm astro check  # TypeScript type-checking
./deploy.sh       # Build + rsync dist/ to VPS
```

No test or lint scripts are configured.

## Architecture

### Routing & Layouts

File-based routing via `src/pages/`. All pages wrap with `BaseLayout.astro` (root HTML shell, nav, footer, theme toggle). Blog posts use `PostLayout.astro` which adds `prose` typography classes. Dynamic blog routes use `getStaticPaths()` with Astro Content Collections.

### Content Collections

Defined in `src/content.config.ts` with Zod schemas:
- **blog**: `title`, `date`, `tags[]`, `draft`, `description?` — drafts filtered via `!data.draft`
- **projects**: `title`, `description`, `tech[]`, `url?`, `github?`, `featured`, `order`, `cover?` — sorted by `data.order`

### Styling

- Tailwind CSS v4 loaded as a Vite plugin (`@tailwindcss/vite`) — no `tailwind.config` file exists
- Design tokens in `src/styles/global.css` under `@theme {}`: `--color-bg`, `--color-surface`, `--color-border`, `--color-accent` (`#e8398d`), `--color-text`, `--color-muted`
- **Dark mode is the default.** Light mode activates via `html.light` class
- Theme toggle uses `localStorage` in an inline script in `BaseLayout`; re-applies on `astro:after-swap` for View Transitions
- `@tailwindcss/typography` used on blog posts via `prose prose-invert prose-sm` on `<article>` in `PostLayout`

### Static Data

`src/data/resume.ts` exports typed arrays (`experience`, `education`, `skills`) consumed by `resume.astro`. No external API or CMS.

### View Transitions

`<ViewTransitions />` from `astro:transitions` is included in `BaseLayout` for SPA-style navigation.

## Conventions

- **Path alias**: `@/*` maps to `src/*` — always use `@/` imports
- **Component props**: declare `interface Props` in frontmatter, then destructure from `Astro.props`
- **File comment**: `.astro` files start with `// src/path/to/file.astro` in frontmatter
- **Page container**: `max-w-4xl mx-auto px-6`
- **Section headings**: `font-mono text-sm text-muted uppercase tracking-widest`
- **Focus styles**: `focus-visible:ring-2 focus-visible:ring-accent`
- **SVG icons**: inlined directly in components (no icon library)
- **Fonts**: Inter (sans), JetBrains Mono (mono) via Google Fonts

## Claude Code Automations

### MCP Servers
- **context7**: Live documentation lookup for Astro, Tailwind, and other libraries. Configured in `.mcp.json`.

### Hooks (`.claude/settings.json`)
- **PreToolUse**: Blocks edits to `deploy.sh` — edit it manually to avoid accidental production changes.
- **PostToolUse**: Runs `astro check` after every file edit to catch TypeScript errors immediately.

### Skills
- `/deploy` — Build and deploy to VPS with confirmation. User-invoked only.
- `/new-post <title>` — Scaffold a new blog post with correct frontmatter. User-invoked only.
