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
| `pnpm check` | Run `astro check` to validate Astro, TypeScript, and content collection types |
| `pnpm validate:build` | Run the production Astro build as a validation-only step |

## Environment Variables

Environment variables are optional for local development. Keep local secrets in `.env` or deployment-specific files that are not checked in.

| Variable | Required | Purpose |
| :-- | :-- | :-- |
| `GITHUB_TOKEN` | No | Enables the GraphQL request behind the stat strip, contribution grid, and language list on the home page. Without it, those elements are omitted. |

### GitHub Data

`src/components/GitHubSection.astro` fetches GitHub data during the Astro build. One authenticated GraphQL request — costing a single rate-limit point — supplies the repository count, follower count, contribution calendar, and language byte totals. One unauthenticated REST request supplies the recent-activity feed.

**There are no content fallbacks.** Every number in this section is either read from the API on that build or omitted along with the row that would have carried it, matching how `src/data/build-info.ts` drops unsubstantiated title-block rows. An earlier revision had five fallback constants that rendered as fact whenever the anonymous REST limit (60/hr per IP) was hit; they are gone.

`GITHUB_TOKEN` only needs access to public GitHub data. Without it the GraphQL request is skipped and the stat strip, contribution grid, and language list are all absent; the activity feed still renders if REST succeeds. If every element is absent the whole section does not render. Builds complete either way.

One exception to graceful degradation is deliberate: if GraphQL answers with an `errors` array, the build **fails**. GraphQL returns HTTP 200 on permission and schema failures, so a scope-limited token nulls the response and would otherwise silently blank the section with nothing in the build log.

For local builds, put `GITHUB_TOKEN=...` in an untracked `.env` file. Deployment environments should configure `GITHUB_TOKEN` as a private build-time environment variable. Do not use `PUBLIC_GITHUB_TOKEN` or another client-exposed variable name, and never commit tokens or private environment files.

Production build validation should pass without `GITHUB_TOKEN`; running it with a private token additionally exercises GraphQL-backed contribution and language data.

## Verification

Use these checks before merging or deploying content and UI changes:

1. Run `pnpm check`.
2. Run `pnpm validate:build` to exercise production rendering and the no-token path, where GitHub-derived rows are omitted rather than filled.
3. Preview production output with `pnpm preview` when visual behavior needs a local production check.

## Deployment

Deployment is currently handled by `./deploy.sh`. Treat that script as the source of truth for the production target and rsync destination unless it is deliberately changed.

Current behavior:

- Loads private connection details from `.env.deploy`.
- Runs `pnpm build`.
- Uses `rsync -avz --delete` to sync `dist/` to the configured VPS destination.
- Keeps private host, user, path, and key details out of this public README.

Deployment prerequisites:

1. Install dependencies with `pnpm install`.
2. Confirm SSH access to the VPS is configured locally.
3. Load the deployment SSH key with `ssh-add` before running the script.
4. Keep private host/IP values, SSH key material, and production secrets out of checked-in files.

`.env.deploy` is gitignored and must define the private deployment target used by `deploy.sh`:

```bash
REMOTE_USER="..."
REMOTE_HOST="..."
REMOTE_PATH="..."
```

### Safe Deploy Checklist

Because deployment uses `rsync --delete`, treat each deploy as a production sync:

1. Run `pnpm check`.
2. Run `pnpm validate:build`.
3. Confirm `.env.deploy` points at the intended production user, host, and path before syncing.
4. Confirm SSH access and deployment credentials are available locally, with the deployment key loaded via `ssh-add`.
5. Confirm no private files, tokens, SSH keys, or host-specific notes are being added to git; `.env` and `.env.deploy` must remain untracked.
6. Confirm build-time secrets use private names such as `GITHUB_TOKEN`, never client-exposed names such as `PUBLIC_GITHUB_TOKEN`.
7. Run `./deploy.sh`, which runs `pnpm build` again before syncing `dist/`.
8. Check the live site after rsync completes.

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
- Blog ideas and drafting workflow live in `docs/blog-backlog.md`.

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
5. Run `pnpm check` and `pnpm validate:build`.
