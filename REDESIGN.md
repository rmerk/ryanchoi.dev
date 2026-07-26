# Redesign — `portfolio-redesign-v2`

Branch cut from `portfolio-visual-redesign` at `b07b34e`. Visual redesign only: no
URL changes, no content-collection schema changes, no copy rewrites, no deploy.

## Chosen direction: Technical Specification, warm palette

> A portfolio that reads like a well-typeset engineering spec sheet, not a landing
> page — structure and hierarchy do the work that decoration was doing.

This is direction **A** (spec-sheet structure) rendered in direction **B**'s warm
espresso/amber palette, chosen from three options to avoid the generic AI/startup
look the previous version had drifted into.

**What the previous design was doing wrong.** Cyan-on-blue-black (`#22d3ee` on
`#0a0a0a`) is the default "technical product" palette of the last few years. On top
of it sat translucent glass (`bg-surface/75` + `backdrop-blur`) on the nav, hero
panel, cards and tiles; `rounded-3xl` on effectively every container; `shadow-2xl`;
four stacked ambient background layers (a body radial gradient, a second hero
radial glow, a dot grid, and a grain overlay); an `animate-ping` status dot; and a
3D-rotated "portfolio.signal" panel showing invented product UI. Individually
defensible, collectively indistinguishable from a template.

**What replaced it.**

| | Before | After |
|---|---|---|
| Separation | Cards — surface tint, blur, radius, shadow | 1px hairline rules |
| Geometry | `rounded-3xl` everywhere | Squared; `rounded-sm` only on heatmap cells |
| Depth | `shadow-2xl`, `backdrop-blur`, 4 ambient layers | Flat. One inset surface (the contribution grid) |
| Hero | Full-viewport, glow, mock panel | Masthead: display statement + ruled `<dl>` spec table |
| Sections | Unnumbered headers | `01 / SELECTED WORK` over a rule |
| Projects | 3-up card grid with cover scrims | Ruled index rows, numeral in the left gutter |
| Nav | Fixed, translucent, pill group | Sticky, opaque, full-height tabs with a 2px accent underline |
| Accent use | Links, borders, glows, dots, badges | Links, current state, and live-status markers only |

## Token changes

All semantic token names are preserved; values changed and a few tokens were added.
Tokens live in `src/styles/global.css` under `@theme {}` with `html.light` overrides.

| Token | Dark (default) | Light | Notes |
|---|---|---|---|
| `--color-bg` | `#14110f` | `#f5f1e8` | Warm espresso / bone, not blue-black / blue-white |
| `--color-surface` | `#1b1714` | `#fbf8f2` | |
| `--color-surface-raised` | `#241f1a` | `#ece6da` | |
| `--color-border` | `#322b25` | `#ddd5c6` | **Decorative hairline only** |
| `--color-border-strong` | `#6b6055` | `#8d8171` | **New.** Interactive borders; ≥3:1 |
| `--color-text` | `#f2ede6` | `#1c1815` | |
| `--color-muted` | `#b8ada0` | `#574f45` | |
| `--color-muted-soft` | `#918678` | `#6f665a` | |
| `--color-accent` | `#e8a33d` | `#8f5400` | Amber cannot clear AA on bone, so light gets its own value |
| `--color-accent-secondary` | `#f0bd72` | `#6b3d00` | |
| `--color-accent-ink` | `#14110f` | `#f5f1e8` | **New.** Text on an accent fill |
| `--color-code-keyword` | `#e8a33d` | `#8f5400` | **New.** Resume editor syntax |
| `--color-code-type` | `#9bbf8a` | `#3f6b30` | **New.** Was hardcoded `text-accent-secondary` |
| `--color-code-string` | `#c9a87c` | `#7a5320` | **New.** Was hardcoded `text-green-400` |

Removed: `--color-glow` (nothing references it in a flat design).

Added non-color tokens: `--text-label`, `--text-display-1/2/3` (fluid `clamp()`,
so display type needs no breakpoint variants), `--tracking-label`.

Added utilities: `label` (mono / uppercase / tracked metadata — the single most
repeated pattern on the site) and `rule-link` (an underline that draws in on hover
via `background-size`, so it animates without reflow).

**Type:** Inter + JetBrains Mono → **Archivo** + **IBM Plex Mono**, still Google
Fonts with `preconnect`. Loaded `display=optional` rather than `swap`: the browser
either has the face at first paint or renders the fallback for that load and never
swaps, so a webfont cannot introduce CLS. First-time visitors may see the fallback;
subsequent visits paint Archivo from cache.

## Accessibility

Contrast measured against the live computed tokens in both themes:

| Pair | Dark | Light | Floor |
|---|---|---|---|
| text / bg | 16.15 | 15.64 | 4.5 |
| muted / bg | 8.53 | 7.14 | 4.5 |
| muted-soft / bg | 5.27 | 5.00 | 4.5 |
| muted-soft / surface | 4.99 | 5.32 | 4.5 |
| accent / bg | 8.72 | 5.42 | 4.5 |
| accent-ink / accent | 8.72 | 5.42 | 4.5 |
| **border-strong / bg** | **3.07** | **3.38** | **3.0** (WCAG 1.4.11) |
| code-type / surface | 8.66 | 5.90 | 4.5 |
| code-string / surface | 7.95 | 6.42 | 4.5 |

Other fixes made along the way:

- **Heading order.** Project and post titles were `<h2>` directly under the page
  `<h1>` on the homepage, skipping a level relative to their section. They now take
  a `headingLevel` prop: `h2` on the index pages where they are the page's content,
  `h3` on the homepage under a section `h2`.
- **`PostRow` link scope.** The anchor wrapped date + title + chevron, producing a
  verbose accessible name. Only the title is a link now.
- **Focus.** The unlayered `:focus-visible` rule in `global.css` outranks Tailwind's
  utility layer, so the 20 `focus-visible:outline-none focus-visible:ring-*`
  combinations scattered through the components were dead code — `outline-none`
  never applied and the ring box-shadow rendered fully transparent. They were
  removed and the global rule documented as the single source of truth.
- **Resume line numbers** moved from `--color-muted` at `0.5` opacity (well under
  AA) to `--color-muted-soft` at full opacity.
- **Contribution grid** gained `role="img"` and a summary label; its decorative
  legend is `aria-hidden`.
- **Mobile menu button** gained the `aria-controls` it was missing; nav links gained
  `aria-current="page"`.
- **Reduced motion** now zeroes every animation and transition via the universal
  selector plus `::view-transition-*`, instead of a hand-listed few. Nothing in the
  design depends on motion.

## Deliberate removals

- **The hero mock panel.** It rendered invented product UI ("portfolio.signal",
  "Frontend Engineering", a "senior" badge) that corresponded to nothing real. It
  was dropped rather than restyled.
- **The GitHub avatar.** An external request to `github.com/rmerk.png` for a
  decorative image, in a section that is otherwise data.
- **Per-language and per-event color maps.** `bg-blue-400`, `bg-emerald-400`,
  `bg-purple-400` etc. — an arbitrary rainbow that fought a single-accent system.
  The label carries the meaning; intensity on the contribution grid is now the only
  thing expressed in color.
- **macOS traffic lights** on the resume editor, replaced with neutral window marks.

## Left for follow-up

1. **`public/logo.svg` is a yellow-to-magenta gradient.** The magenta stop clashes
   with amber, so `src/components/Logo.astro` renders a `currentColor` monochrome
   version of the same mark. **The original asset is untouched** — this is a brand
   decision, not a page-styling one, so revert by swapping `<Logo />` back for the
   `<img src="/logo.svg">` in `Nav.astro` and `Footer.astro`. A proper fix is a
   two-tone mark designed against this palette.
2. **The GitHub REST calls are unauthenticated.** `GITHUB_TOKEN` is sent on the
   GraphQL request but not on the three REST requests, which are rate-limited and
   currently falling back to hardcoded values — the "30 repositories / 15 followers"
   and the two-repo list on the live page are `fallbackProfile` and `fallbackRepos`,
   not real data. Pre-existing; not touched because it is data, not design.
3. **`public/covers/*.png` are ~3 MB each and unreferenced.** No project sets
   `cover:`. `ProjectCard` still supports the field (lazy, `decoding="async"`,
   explicit dimensions), but the images need compressing before anything uses them.
4. **Copy is stale in places.** `src/content/blog/hello-world.md` still describes the
   site as "dark background, accent pink"; `src/content/projects/ryanchoi-dev.md`
   says "dark-themed". Copy rewrites were explicitly out of scope.
5. **`ViewTransitions` is deprecated** in Astro 5 (`astro check` reports it as a
   hint). It should become `ClientRouter`. Pre-existing; unrelated to the redesign.
6. **Section rhythm at low content volume.** With two projects and one post, the
   `py-16 sm:py-20` section spacing reads airy. Worth revisiting once there is more
   content rather than tuning it to the current sparse state.
