// src/data/build-info.ts
// Build provenance for the masthead title block. Runs in Node at build time and is
// never reachable from a <script>, so nothing here is bundled for the client.
// deploy.sh builds locally from the repo root, so git is present on every real
// build; the catch covers a source tarball or a checkout without .git, in which
// case HeroSection drops the rows it cannot substantiate rather than printing a
// placeholder.
//
// execFileSync with an argument array, not execSync with an interpolated string:
// no shell is spawned, so nothing here can ever become a shell injection if these
// arguments stop being hardcoded literals.
import { execFileSync } from 'node:child_process';

function git(args: string[]): string {
  try {
    return execFileSync('git', args, {
      encoding: 'utf8',
      // stderr to /dev/null: a missing .git should not put noise in the build log.
      stdio: ['ignore', 'pipe', 'ignore'],
      cwd: process.cwd(),
    }).trim();
  } catch {
    return '';
  }
}

export const buildInfo = {
  commit: git(['rev-parse', '--short', 'HEAD']),
  // %cs is the committer date already formatted YYYY-MM-DD — no Date construction,
  // no timezone drift, and no locale formatting that could differ between machines.
  date: git(['log', '-1', '--format=%cs']),
} as const;
