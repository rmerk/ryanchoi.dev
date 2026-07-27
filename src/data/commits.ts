// src/data/commits.ts
// Conventional-commit type breakdown for the checked-out ref, read at build time.
//
// Same execFileSync-with-an-argument-array pattern as build-info.ts: no shell, so
// nothing here can be influenced by a branch name containing shell metacharacters.
//
// The interesting fact is not the volume, it is the parse rate. Every commit message
// on this repository matches the convention, and a figure that says "100% of 106"
// is a claim about discipline that can be checked. If that ever stops being true the
// figure says so rather than quietly dropping the strays.
import { execFileSync } from 'node:child_process';

function git(args: string[]): string | null {
  try {
    return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

export interface CommitType {
  type: string;
  count: number;
}

export interface CommitBreakdown {
  types: CommitType[];
  total: number;
  parsed: number;
  /** The ref these counts describe. Branch-dependent, so it is published alongside. */
  ref: string;
}

export function buildCommitBreakdown(): CommitBreakdown | null {
  // A shallow clone lets `git log` succeed and return a truthful-looking fragment —
  // the try/catch in build-info.ts covers a missing .git but not this. A CI runner
  // using actions/checkout at its default fetch-depth of 1 would publish "1 commit"
  // with nothing failing, so refuse to draw the figure at all.
  if (git(['rev-parse', '--is-shallow-repository']) !== 'false') return null;

  const subjects = git(['log', '--format=%s']);
  if (subjects === null) return null;

  const lines = subjects.split('\n').filter((line) => line.length > 0);
  if (lines.length === 0) return null;

  const counts = new Map<string, number>();
  let parsed = 0;

  for (const line of lines) {
    // type(optional scope)!: subject
    const match = line.match(/^([a-z]+)(\([^)]*\))?!?:\s/);
    if (!match) continue;
    parsed += 1;
    counts.set(match[1], (counts.get(match[1]) ?? 0) + 1);
  }

  return {
    types: [...counts.entries()]
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count),
    total: lines.length,
    parsed,
    ref: git(['rev-parse', '--abbrev-ref', 'HEAD']) || 'HEAD',
  };
}
