# Resume IDE Redesign — Design Document

## Goal

Redesign the resume page (`/resume`) as a VS Code-style editor window. The entire page becomes a single code editor displaying career data as syntax-highlighted TypeScript. Purely visual — no interactivity beyond anchor-linked tabs and a lightweight IntersectionObserver for active tab highlighting.

## Architecture

The resume page replaces its current timeline layout with an editor chrome wrapper containing three "files" rendered as continuous TypeScript source code. The existing `src/data/resume.ts` data is consumed unchanged. All styling uses the project's existing design tokens (`accent`, `accent-secondary`, `green-400`, `muted`, `text`, `surface`, `border`, `bg`).

## Components

### Editor Chrome (outer shell)

```
┌─────────────────────────────────────────────────┐
│ ● ● ●    resume.ts — ryanchoi.dev              │  title bar
├────────┬──────────┬──────────────┬──────────────┤
│ experience.ts │ skills.ts │ education.ts │      │  tab bar
├────┬────────────────────────────────────────┬────┤
│    │                                        │░░░░│
│ 1  │  content...                            │░░░░│  line numbers + content + minimap
│ ...│                                        │░░░░│
├────┴────────────────────────────────────────┴────┤
│ ⎇ main  ✓ TypeScript  UTF-8  Ln 42, Col 1      │  status bar
└─────────────────────────────────────────────────┘
```

- **Title bar**: Three colored dots (red `#ff5f57`, yellow `#febc2e`, green `#28c840`), centered filename
- **Tab bar**: Three tabs as anchor links (`#experience`, `#skills`, `#education`). Active tab has bottom `accent` border + `bg` background, inactive tabs have `surface` background
- **Status bar**: Branch icon + "main", checkmark + "TypeScript", "UTF-8", fake cursor position. `surface` background
- **Minimap**: Right column, `hidden lg:block`, CSS `scale(0.15)` + `blur(0.5px)` on a duplicate of the content, `w-20` fixed, `overflow-hidden`

### Content Rendering

All content renders inside a `<pre><code>` style block (using `font-mono`) with continuous line numbers.

**Syntax coloring map:**
- Keywords (`const`, `type`) → `text-accent` (pink `#e8398d`)
- Type names (`Role[]`, `Stack`) → `text-accent-secondary` (purple)
- Strings (role names, bullets, skill names) → `text-green-400`
- Property names (role, company, period) → `text-text` (white/dark)
- Punctuation (`{`, `[`, `:`, `,`) → `text-muted`
- Comments (`//`) → `text-muted italic`
- Company/institution names → `text-accent` as clickable `<a>` tags

**Experience section:**
```
const experience: Role[] = [
  {
    role: "Web Development Engineer",
    company: "Kount, an Equifax Company",    // clickable link
    period: "June 2024 → Present",
    highlights: [
      "Develop branded templates...",
      ...
    ],
  },
  ...
];
```

**Skills section:**
```
type Stack = {
  languages: ["TypeScript", "JavaScript", "PHP"],
  frameworks: ["Vue", "React", "Astro"],
  tools: ["Docker", "Figma", "Sass", "Vite", "Git", "Tailwind CSS"],
  databases: ["MariaDB", "PostgreSQL", "MySQL"],
};
```

**Education section:**
```
const education = {
  credential: "Software Engineer Certificate",
  institution: "Prime Digital Academy",      // clickable link
  period: "July 2015 → Nov 2015",
};
```

### Active Tab Tracking

A small inline `<script>` uses `IntersectionObserver` to watch the three section IDs (`#experience`, `#skills`, `#education`). When a section enters the viewport, its corresponding tab gets the active class (`border-b-2 border-accent`). Re-registers on `astro:after-swap` for View Transitions compatibility.

## Responsive Behavior

| Element | Desktop (`lg+`) | Mobile |
|---------|-----------------|--------|
| Minimap | Visible, `w-20` | Hidden |
| Tab bar | Static row | Horizontally scrollable |
| Line numbers | `w-12`, `text-sm` | `w-8`, `text-xs` |
| Code content | `text-sm` | `text-xs` |
| Status bar | Full info | Branch + language only |
| Title bar dots | Visible | Visible |
| Container | `max-w-6xl` | Full width with `px-4` |

## Files Modified

- **Replace**: `src/pages/resume.astro` — complete rewrite
- **No changes**: `src/data/resume.ts` — data consumed as-is
- **No changes**: `src/styles/global.css` — existing tokens sufficient

## No New Dependencies

All styling with Tailwind utility classes and scoped `<style>` blocks. IntersectionObserver is native browser API.
