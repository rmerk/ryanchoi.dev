# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio and blog for Ryan Choi (`ryanchoi.dev`). A static site built with Astro 5, Tailwind CSS v4, and TypeScript. Deployed to a Vultr VPS via rsync.

## Deployment

- **Deploy script**: `deploy.sh` loads `.env.deploy`, runs `pnpm build`, then `rsync -avz --delete dist/` to the configured VPS destination.
- **Current target**: `.env.deploy` must define `REMOTE_USER`, `REMOTE_HOST`, and `REMOTE_PATH`.
- **Private config**: `.env.deploy` is gitignored and holds private deployment target details. Keep it out of git.
- **SSH key**: `~/.ssh/ryanchoi_deploy` (ed25519, must be loaded via `ssh-add` before deploy)
- **Nginx config**: `/etc/nginx/conf.d/http.conf` on the VPS (static site, SSL via Certbot)
- **Shared VPS**: Also hosts clearstack (Node+PM2, config in `/etc/nginx/conf.d/clearstackdev.com.conf`)
- **Sensitive values**: Keep real host/IP values, SSH key material, and production secrets out of checked-in docs and config.

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
- Design tokens in `src/styles/global.css` under `@theme {}`: `--color-bg`, `--color-surface`, `--color-surface-raised`, `--color-border`, `--color-border-strong`, `--color-accent` (`#e8a33d` dark / `#8f5400` light), `--color-accent-ink`, `--color-text`, `--color-muted`, `--color-muted-soft`, plus `--color-code-*` for the resume editor
- Custom utilities in `global.css`: `label` (mono/uppercase/tracked metadata) and `rule-link` (underline that draws in on hover)
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
- **Page container**: `max-w-5xl mx-auto px-5 sm:px-8` (prose narrows to `max-w-3xl`)
- **Section headings**: numbered `01 / SECTION NAME` in the `label` utility, over a `border-t border-border` rule
- **Focus styles**: handled globally by the unlayered `:focus-visible` rule in `global.css`. Do not add `focus-visible:outline-none`/`ring-*` utilities — the global rule outranks them, so they are dead code.
- **SVG icons**: inlined directly in components (no icon library)
- **Fonts**: Archivo (sans), IBM Plex Mono (mono) via Google Fonts, loaded `display=optional` to avoid CLS
- **Geometry**: squared — no `rounded-*` beyond `rounded-sm`, no shadows, no `backdrop-blur`. Separation comes from hairline rules.
- **Borders**: `border-border` is decorative hairline only; interactive controls use `border-border-strong` (clears WCAG 1.4.11's 3:1)

## Claude Code Automations

### MCP Servers
- **context7**: Live documentation lookup for Astro, Tailwind, and other libraries. Configured in `.mcp.json`.

### Hooks (`.claude/settings.json`)
- **PreToolUse**: Blocks edits to `deploy.sh` — edit it manually to avoid accidental production changes.
- **PostToolUse**: Runs `astro check` after every file edit to catch TypeScript errors immediately.

### Skills
- `/deploy` — Build and deploy to VPS with confirmation. User-invoked only.
- `/new-post <title>` — Scaffold a new blog post with correct frontmatter. User-invoked only.
