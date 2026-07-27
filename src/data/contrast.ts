// src/data/contrast.ts
// Computes the design system's contrast matrix from global.css at build time.
//
// The values are parsed out of the stylesheet rather than copied into a table here,
// so the figure cannot drift from the tokens it describes: changing a token changes
// the published number on the next build, and a token that disappears fails the build
// instead of quietly publishing a stale ratio.
//
// What this is NOT: a measured floor for the site. The token table cannot tell you
// which pairs actually occur in the rendered DOM — the real light-mode floor comes
// from accent on surface-raised, a pair that was absent from the hand-written table
// for exactly that reason. This is the palette's capability, and the figure says so.
// Imported with Vite's ?raw so the stylesheet's text is inlined at build time. Reading
// it from disk instead does not work: this module is bundled into dist/pages/ for the
// static build, so an import.meta.url-relative path resolves against the output tree
// rather than src/. ?raw also makes the dependency explicit — edit global.css and Vite
// rebuilds this.
import cssSource from '@/styles/global.css?raw';

function parseTokens(css: string, blockStart: RegExp): Record<string, string> {
  const start = css.search(blockStart);
  if (start < 0) throw new Error(`contrast.ts: could not find ${blockStart} in global.css`);

  // Walk braces from the block's opening one so a nested rule (@keyframes inside
  // @theme) cannot terminate the scan early on its own closing brace.
  const open = css.indexOf('{', start);
  let depth = 0;
  let end = open;
  for (let i = open; i < css.length; i++) {
    if (css[i] === '{') depth++;
    if (css[i] === '}') {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }

  const tokens: Record<string, string> = {};
  for (const match of css.slice(open, end).matchAll(/--color-([a-z-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) {
    tokens[match[1]] = match[2];
  }
  return tokens;
}

function channelLuminance(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex: string): number {
  const value = parseInt(hex.slice(1), 16);
  const r = channelLuminance((value >> 16) & 255);
  const g = channelLuminance((value >> 8) & 255);
  const b = channelLuminance(value & 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(a: string, b: string): number {
  const [lighter, darker] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
}

interface PairSpec {
  foreground: string;
  background: string;
  /** 4.5 for body text under WCAG 1.4.3, 3.0 for UI boundaries and graphics under 1.4.11. */
  floor: number;
  note?: string;
}

// Every pair the design actually relies on, including the two that set the real floor.
const PAIRS: PairSpec[] = [
  { foreground: 'text', background: 'bg', floor: 4.5 },
  { foreground: 'muted', background: 'bg', floor: 4.5 },
  { foreground: 'muted-soft', background: 'bg', floor: 4.5 },
  { foreground: 'muted-soft', background: 'surface', floor: 4.5, note: 'sets the dark floor' },
  { foreground: 'accent', background: 'bg', floor: 4.5 },
  { foreground: 'accent', background: 'surface-raised', floor: 4.5, note: 'sets the light floor' },
  { foreground: 'accent-ink', background: 'accent', floor: 4.5 },
  { foreground: 'code-type', background: 'surface', floor: 4.5 },
  { foreground: 'code-string', background: 'surface', floor: 4.5 },
  { foreground: 'border-strong', background: 'bg', floor: 3, note: 'WCAG 1.4.11' },
];

export interface ContrastRow {
  label: string;
  dark: number;
  light: number;
  floor: number;
  note?: string;
  passes: boolean;
}

export interface ContrastMatrix {
  rows: ContrastRow[];
  /** The weakest ratio in each theme across the pairs above. */
  darkFloor: number;
  lightFloor: number;
  /** The conservative figure published in the hero, which both floors clear. */
  publishedFloor: number;
}

export function buildContrastMatrix(): ContrastMatrix {
  const dark = parseTokens(cssSource, /@theme\s*\{/);
  const lightOverrides = parseTokens(cssSource, /html\.light\s*\{/);
  // Light mode overrides a subset; anything it does not restate keeps the @theme value.
  const light = { ...dark, ...lightOverrides };

  const resolve = (tokens: Record<string, string>, name: string, theme: string): string => {
    const value = tokens[name];
    if (!value) throw new Error(`contrast.ts: --color-${name} is not defined for ${theme}. The pair list and global.css have drifted apart.`);
    return value;
  };

  const rows = PAIRS.map(({ foreground, background, floor, note }) => {
    const darkRatio = contrastRatio(resolve(dark, foreground, 'dark'), resolve(dark, background, 'dark'));
    const lightRatio = contrastRatio(resolve(light, foreground, 'light'), resolve(light, background, 'light'));

    return {
      label: `${foreground} on ${background}`,
      dark: Math.round(darkRatio * 100) / 100,
      light: Math.round(lightRatio * 100) / 100,
      floor,
      note,
      passes: darkRatio >= floor && lightRatio >= floor,
    };
  });

  const textRows = rows.filter((row) => row.floor >= 4.5);

  return {
    rows,
    darkFloor: Math.min(...textRows.map((row) => row.dark)),
    lightFloor: Math.min(...textRows.map((row) => row.light)),
    publishedFloor: 4.5,
  };
}
