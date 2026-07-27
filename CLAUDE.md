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
- `global.css` opens with `@import "tailwindcss" source(none)` and one explicit glob: `@source "../**/*.{astro,ts,tsx,js,jsx,md,mdx,html}"`. It is relative to `src/styles/`, so it covers all of `src/` recursively — a new directory *inside* `src/` needs nothing. What does need adding: **a new file extension**, or **any path outside `src/`**. Otherwise those files' utilities are never generated
- Design tokens in `src/styles/global.css` under `@theme {}`:
  - **Colour**: `--color-bg`, `--color-surface`, `--color-surface-raised`, `--color-border`, `--color-border-strong`, `--color-accent` (`#e8a33d` dark / `#8f5400` light), `--color-accent-secondary`, `--color-accent-ink`, `--color-text`, `--color-muted`, `--color-muted-soft`, plus `--color-code-*` for the resume editor
  - **Type**: `--text-label` and the fluid `--text-display-1` / `-2` / `-3` (`clamp()`, no breakpoint variants needed), `--tracking-label`
  - **Layout**: `--spacing-datum` — the label/value tab stop shared by the hero legend, hero spec table, section headers, and homepage index rows. Change the rail here, not at the call sites
  - **Motion**: `--animate-seq-rise` (the `seq-rise` keyframes, used by the h1, legend, lede, CTAs, title block and `seq-rows`). A second keyframes, `seq-wipe`, is declared outside `@theme` and drives `rule-draw` only. Both declare a `from` and no `to`, so the finished state is the element's own computed style — never declare the hidden state in a rule
- Custom utilities in `global.css`, all seven:
  - `label` — mono/uppercase/tracked metadata
  - `rule-link` — underline that draws in on hover
  - `datum-row` — puts a grid row on the `--spacing-datum` rail; variant-capable (`sm:datum-row`, `lg:datum-row`)
  - `rule-draw` — draws a `border-t` in left-to-right by retracting a background-coloured eraser off it
  - `seq-rows` — staggers direct children into place; the stagger lives here, not in markup
  - `mark-word` — the underlined claim word in the h1
  - `mark-note` — its raised accent footnote numeral
- **Dark mode is the default.** Light mode activates via `html.light` class
- Theme toggle uses `localStorage` in an inline script in `BaseLayout`; re-applies on `astro:after-swap` for View Transitions
- `@tailwindcss/typography` used on blog posts via `prose prose-sm` on `<article>` in `PostLayout`. **Not `prose-invert`** — the `.prose` block in `global.css` colours typography from tokens, so both themes render first-class instead of light being an inversion of dark

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
- **Focus styles**: handled globally by the unlayered `:focus-visible` rule in `global.css`. Do not add `focus-visible:outline-none`/`ring-*` utilities — the global rule outranks them, so they are dead code. The one exception also lives in `global.css`: `.editor-tab` draws its outline inset, because the resume tab bar's `overflow-x-auto` inside an `overflow-hidden` window clips an offset one. Style focus there, never per-component.
- **Metadata lines**: the slash-separated `label` list (project tech, post tags, GitHub languages) is `MetaList.astro`. Pass `items` and let it own the separators. `PostLayout`'s masthead line is deliberately not built on it — its separator leads each item rather than sitting between them.
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
