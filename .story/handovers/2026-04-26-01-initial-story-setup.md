# Initial Story setup

This handover records the first Story setup for ryanchoi-dev, an existing Astro portfolio and blog.

## Project decisions captured

- Surface: website/content site for a personal portfolio and blog.
- Stack: Astro 5, TypeScript, Tailwind CSS v4 via the Vite plugin, Astro Content Collections, and static output.
- System shape: single static site with file-based routes under src/pages, shared Astro components, BaseLayout/PostLayout, and no backend application server.
- Data model: content collections for blog posts and projects, plus typed resume data in src/data/resume.ts. There is no database or auth system.
- AI pattern/provider/processing: none.
- Sensitive domain: no regulated or sensitive product domain; the site is public portfolio content.
- Deployment: self-hosted/VPS deployment via deploy.sh and rsync. A mismatch was discovered between CLAUDE.md's .env.deploy guidance and deploy.sh hardcoded values; ISS-003 tracks the resolution.
- Quality pipeline: Story recipe overrides now run pnpm astro check as TEST and pnpm build as BUILD. WRITE_TESTS and VERIFY are disabled because this is a static content site with no test suite or endpoint smoke surface yet.
- GitHub signal: GitHubSection uses public REST API data by default and optional GITHUB_TOKEN-backed GraphQL data for contribution and language details.

## Setup work completed

Created five phases: Foundation, Visual System, Portfolio Content, GitHub Signal, and Quality and Ops.

Created 20 tickets. Existing completed work was backfilled only where source, docs, and recent commits supported it: T-001, T-002, T-005, T-007, and T-008.

Filed three issues:
- ISS-001: README still uses Astro starter content.
- ISS-002: Story MCP status did not detect this workspace while the CLI did.
- ISS-003: Deployment docs and deploy script disagree on configuration source.

Created the first snapshot before this handover so future recaps can show Story drift from this baseline.

## Recommended next work

Start with unblocked foundation/ops work:
- T-004: Capture deployment and environment configuration baseline.
- T-016: Add check script alias for astro check.
- T-003: Document content authoring conventions after reviewing the existing content schemas.

Avoid editing deploy.sh unless explicitly requested; it is production-sensitive and protected by project automation guidance.
