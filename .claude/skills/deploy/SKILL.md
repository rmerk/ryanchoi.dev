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
3. Ask the user to confirm deployment to production.
4. Only after explicit confirmation, run `./deploy.sh` from the project root.
5. Report the rsync output to the user.

## Important

- NEVER deploy without explicit user confirmation.
- If `pnpm build` fails, stop and show the errors — do not deploy.
- The deploy script is the source of truth for connection details and currently does not source `.env.deploy`.
- The deploy script rsyncs `dist/` to the VPS with `--delete`, meaning files not in `dist/` will be removed from the server.
