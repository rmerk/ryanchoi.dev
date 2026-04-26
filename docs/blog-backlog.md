# Blog Publishing Backlog

This backlog is a planning artifact for future writing. It is not published by Astro; published posts live in `src/content/blog/`.

## Backlog

| Priority | Status | Working title | Angle | Likely tags |
| :-- | :-- | :-- | :-- | :-- |
| P1 | idea | Designing a Portfolio That Works Like a Product Surface | How to make a personal site useful for recruiters, collaborators, and future maintainers without turning it into a bloated app. | `design-systems`, `portfolio`, `astro` |
| P1 | idea | What Static Sites Still Do Better Than App Frameworks | A practical look at where Astro, Markdown content, and static deploys keep complexity low for portfolio and marketing surfaces. | `astro`, `frontend`, `performance` |
| P2 | idea | Building Resume Content as Typed Data | Lessons from keeping resume content in TypeScript arrays instead of hand-maintained markup. | `typescript`, `developer-tooling`, `portfolio` |
| P2 | idea | The Small Details That Make Cards Feel Reliable | A breakdown of image fallbacks, link validation, focus states, tags, and ordering in project cards. | `accessibility`, `design-systems`, `frontend` |
| P2 | idea | Using AI Agents Without Letting Them Own Your Product Taste | Notes on using agent workflows for repetitive checks while keeping design judgment and scope control human-readable. | `ai-workflows`, `developer-tooling`, `process` |
| P3 | idea | A Calm Checklist for Frontend Visual QA | Turn route checks, responsive passes, theme toggles, keyboard navigation, and reduced-motion review into a repeatable habit. | `accessibility`, `quality`, `frontend` |
| P3 | idea | Tailwind Tokens Without a Tailwind Config | How Tailwind CSS v4 theme tokens can keep a small site consistent without a large design-system setup. | `tailwind`, `design-systems`, `css` |
| P3 | idea | Keeping GitHub Signal Useful on a Portfolio Site | What belongs in a GitHub activity section, how to handle API fallbacks, and how to avoid noisy vanity metrics. | `github`, `developer-tooling`, `portfolio` |

## Draft Workflow

1. Pick one backlog item and refine the working title into a specific promise for the reader.
2. Use `/new-post <title>` to scaffold the Markdown file in `src/content/blog/`.
3. Keep the new post as `draft: true` until the argument, structure, and examples are ready.
4. Use lowercase, reusable tags. Prefer tags already listed in this backlog before inventing a new one.
5. Write the post with concrete project context and avoid generic advice that could fit any site.
6. Before publishing, set `draft: false`, confirm the `date`, and add or update `description`.
7. Run `pnpm astro check` and `pnpm build`.

## Publication Checklist

- The post has a clear reader takeaway in the first few paragraphs.
- Frontmatter matches `src/content.config.ts`.
- Tags are lowercase and reusable.
- Links resolve and open the intended destination.
- Code snippets, if any, are minimal and relevant.
- The post has been reviewed in local preview if it includes unusual formatting.
- `pnpm astro check` and `pnpm build` pass before deploy.
