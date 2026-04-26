# ryanchoi.dev

Personal portfolio and blog for Ryan Choi. The site is built with Astro 5, TypeScript, Tailwind CSS v4, and Astro Content Collections.

## Commands

Run commands from the project root:

| Command | Action |
| :-- | :-- |
| `pnpm install` | Install dependencies |
| `pnpm dev` | Start the local dev server at `localhost:4321` |
| `pnpm build` | Build the static site to `./dist/` |
| `pnpm preview` | Preview the production build locally |
| `pnpm astro check` | Validate Astro, TypeScript, and content collection types |

## Environment Variables

Environment variables are optional for local development. Keep local secrets in `.env` or deployment-specific files that are not checked in.

| Variable | Required | Purpose |
| :-- | :-- | :-- |
| `GITHUB_TOKEN` | No | Enables GraphQL-backed GitHub contribution and language details on the home page. Without it, the site still uses public REST API data and built-in fallbacks. |

## Verification

Use these checks before merging or deploying content and UI changes:

1. Run `pnpm astro check`.
2. Run `pnpm build`.
3. Preview production output with `pnpm preview` when visual behavior needs a local production check.

## Deployment

Deployment is currently handled by `./deploy.sh`. Treat that script as the source of truth for the production target and rsync destination unless it is deliberately changed.

Current behavior:

- Runs `pnpm build`.
- Uses `rsync -avz --delete` to sync `dist/` to the configured VPS destination.
- Keeps private host, user, path, and key details out of this public README.

Deployment prerequisites:

1. Install dependencies with `pnpm install`.
2. Confirm SSH access to the VPS is configured locally.
3. Load the deployment SSH key with `ssh-add` before running the script.
4. Keep private host/IP values, SSH key material, and production secrets out of checked-in files.

`.env.deploy` is gitignored and may be used for private deployment notes or future parameterization, but the current `deploy.sh` does not source it. Changing `.env.deploy` alone will not change deployment behavior.

Before deploying:

1. Run `pnpm astro check`.
2. Run `pnpm build`.
3. Confirm SSH access and deployment credentials are available locally.
4. Run `./deploy.sh`.
5. Check the live site after rsync completes.

## Project Structure

```text
src/
├── components/       Shared Astro components
├── content/          Blog posts and project entries
├── data/             Resume data
├── layouts/          Base and post layouts
├── pages/            File-based routes
└── styles/           Global Tailwind CSS and theme tokens
```

Content schemas live in `src/content.config.ts`. Keep authoring conventions aligned with those schemas rather than adding ad hoc frontmatter fields.

## Content Authoring

### Blog Posts

Blog posts are Markdown files in `src/content/blog/`. The filename becomes the URL slug after `.md` is removed, so `hello-world.md` is served at `/blog/hello-world`.

Example frontmatter:

```yaml
---
title: Starting Fresh
date: 2026-02-17
tags: [meta]
draft: false
description: Redesigning my personal site from the ground up with Astro 5.
---
```

- `title` is required and appears on the blog index and post page.
- `date` is required, is coerced to a date by Astro, and controls reverse-chronological sorting.
- `tags` defaults to `[]`; keep tags short, lowercase, and reusable.
- `draft` defaults to `false`, but set it explicitly so publishing intent is obvious.
- `description` is optional and is passed to the post layout for page metadata.
- Draft posts are filtered out of the blog index, home page latest-writing section, and static post routes.

### Project Entries

Projects are Markdown files in `src/content/projects/`. The current pages render collection metadata in project cards; body content is available for future expansion but is not currently shown on a dedicated project detail route.

Example frontmatter:

```yaml
---
title: ClearStack Dev
description: Marketing site for a software agency serving small businesses in Minnesota.
tech: [Astro, Vue, TypeScript, Tailwind CSS, Cloudflare Pages]
url: https://clearstackdev.com
github: https://github.com/rmerk/clearstack-dev
featured: true
order: 1
cover: /covers/clearstack.png
---
```

- `title`, `description`, and `tech` are required.
- `url` and `github` are optional, but each value must be a valid URL when present.
- `featured` defaults to `false`; set it to `true` to include the project on the home page.
- The home page shows only the first three featured projects after sorting by `order`.
- The full projects page does not filter by `featured`; it shows all projects sorted by `order`.
- `order` defaults to `99`; use explicit low numbers for projects that should appear first.
- `cover` is optional. When used, reference a public path such as `/covers/project-name.png`; if no matching image exists, omit `cover` so the card uses its gradient placeholder.

## Publication Checklist

Before publishing a blog post or project entry:

1. Confirm the frontmatter matches `src/content.config.ts`.
2. Keep filenames lowercase and slug-friendly.
3. Set `draft: false` only when the post is ready to appear publicly.
4. Confirm project `url`, `github`, and `cover` paths work when present.
5. Run `pnpm astro check` and `pnpm build`.
