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
| Accent use | Links, borders, glows, dots, badges | Links, current state, live-status markers, and the h1's footnote numerals |

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
  utility layer, so the `outline-none` half of the 20 scattered
  `focus-visible:outline-none focus-visible:ring-*` combinations never applied. An
  earlier draft of this note claimed the rings were also dead — that was wrong.
  Tailwind v4 defaults `--tw-ring-color` to `currentcolor` and `focus-visible:ring-accent`
  set it explicitly under the same variant, so the rings *did* render. Removing them
  was therefore a change to how focus looks, not a dead-code deletion, and it is what
  exposed the clipped indicator on the resume tabs — see the `.editor-tab` exception
  in `global.css`. The global rule is the single source of truth; that exception is
  an `outline-offset` override, not a second indicator.
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

## Homepage pass — flare

A second pass on `/` only. Every other page rendered byte-identically at the time
(verified by diffing built HTML with the asset hash normalised) — but see the review
pass below, which deliberately gave that up: the `MetaList` extraction changes the
metadata markup on `/blog` and `/projects`, the `Nav` padding fix changes every page,
and the reduced-motion block below already changed every page's behaviour under
`prefers-reduced-motion`. The austerity was working but
the page had exactly one typographic event, three near-identical section stacks, an
empty right third at desktop, and no motion at all.

**The signature: a footnoted masthead.** The h1's two claims are marked and
substantiated in a mono legend directly beneath, so the page proves its headline
instead of asserting it.

| | |
|---|---|
| Marked words | `@utility mark-word` — solid `border-strong` underline, `skip-ink: none`. Not accent (amber under a word inside a heading reads as a link) and not dotted (at 68px, 1px vanishes and 0.035em renders as dashes) |
| Markers | `@utility mark-note` — raised mono numeral in accent, sized in `em` so it tracks the fluid display scale. `line-height: 0` keeps it out of the line box; any other value grows the h1's 1.05 leading and the marker hits the line above |
| Legend | `<dl>`, not `<ol>` — markers are `aria-hidden`, so a screen reader gets term → definition. No `border-t`: alignment on the rail does the structural work, absence of a rule keeps it a caption to the h1 rather than a peer of the spec table |

Claims are held to what the repo can substantiate: static HTML, no client-side UI
framework, `display=optional`, a contrast floor, one focus rule. A CSS-weight figure
was considered and dropped — it cannot be self-measured (Astro renders HTML before
the asset is finalised) and would rot silently. It belongs in `README.md` if anywhere.

**The contrast figure was wrong twice.** It shipped as "15:1 text contrast in both
themes" — that is only `--color-text` on `--color-bg` (16.15 dark, 15.64 light), while
the muted tiers carrying most of the page measure 8.53/7.14 and 5.27/5.00. The
sentence making the claim was itself `text-muted`.

The first correction said 5:1, and was also wrong, for a subtler version of the same
mistake: it recomputed the floor over `--color-bg` only. Text also sits on
`--color-surface` and `--color-surface-raised` — light `--color-accent` on
surface-raised (the resume status bar's branch name) measures **4.92:1**, and the
table above already recorded `muted-soft`/`surface` dark at 4.99.

The line now reads "WCAG AA contrast (4.5:1 floor) in both themes". Measured properly
— every text node, effective background resolved through ancestors, `aria-hidden`
decoration excluded (the `/` dividers are `border-strong` at 3.4:1 and are exempt
under 1.4.3), across both themes and all six routes — the true floor is 4.92:1 light
and 5.27:1 dark. 4.5:1 is a true lower bound with margin, and it is AA's threshold, so
the number carries meaning instead of being a high-water mark that happens to hold.

The lesson worth keeping: **a contrast floor cannot be computed from the token table.**
It has to be measured against what is actually rendered on what.

**Title block.** `src/data/build-info.ts` reads the git short hash and committer
date at build time via `execFileSync` with an argument array (no shell). This added
`@types/node` — a devDependency for typing `node:child_process`, so the "no
client-side UI framework" claim is untouched; nothing new reaches the browser. Rows with
no real value behind them are dropped rather than filled with a placeholder. It
describes the *document* (REV / DATE / SOURCE) where the spec `<dl>` describes the
*person*, and it is `hidden lg:block` — a title block is an artifact of a sheet
having a margin and a corner, and below `lg` there is neither. `SOURCE` is plain
text, which keeps the hero's focusable set at exactly the two CTAs.

**Datum margin.** At `lg`, section index, eyebrow and jump link move into an 8rem
margin with the content column at 9.5rem — the same measure the hero spec table sits
on, so the reader meets the rail in the masthead before meeting it in a section. That
measure is now the `--spacing-datum` token, spent through the `datum-row` utility;
it was the bare literal `8rem` in five separate grid templates, so moving the rail
took five coordinated edits with nothing tying them together. Exactly two tab stops at `lg`, which is what stops the
`ProjectCard` numeral gutter and `PostRow` date gutter becoming a third and fourth.
Rules stay full-width; only apparatus hangs in the margin. `SectionHeader` changed
directly (it is imported only by `index.astro` and `GitHubSection`, which is itself
homepage-only); `ProjectCard` and `PostRow` are genuinely shared, so their rail is
behind a `datum` prop whose false branch is character-for-character the markup it
replaced.

Homepage project rows are numbered `01.1`, `01.2`. At `lg` they share the margin
column with the section's own `01`, and a bare `01` row under an `01` section reads
as a duplicate; compound numbering states the real nesting. `/projects`, where the
rows are top-level, still numbers them `01`, `02`.

**Motion — one sequence, 920ms, hero only.** The h1 rises, the legend and lede
follow at 110ms and 165ms, the spec table's top rule draws in left to right, its rows lift
under it, then the title block and the CTAs. CSS-only; no JS, no scroll observers.
Sections below the fold do not animate.

- **Drawing a hairline:** a border cannot be scaled, so `@utility rule-draw` leaves
  `border-t border-border` exactly as authored and retracts an absolutely-positioned
  eraser filled with `var(--color-bg)` off it (`scaleX(1) → 0`, `transform-origin:
  right`). No layout impact, and it tracks the theme for free.
- **The h1 rises as one block, deliberately.** Per-line would mean wrapping lines in
  `block` spans, which does not animate `text-balance` per line — it *replaces*
  balancing with hardcoded breaks that are wrong at every width but the authored
  one, and forces line breaks into copy/paste. The staccato comes from the ladder.
- **Delays are custom properties inside the `animation` shorthand**
  (`var(--seq-delay, 0ms)`), set with `[--seq-delay:165ms]`. A separate
  `animation-delay` utility would be a cascade-ordering gamble, since the shorthand
  resets it to `0s`.

**The invariant that makes the motion safe:** every `@keyframes` declares only a
`from`. The implicit `to` is the element's own computed style, so no rule in the
stylesheet ever declares the hidden state. Verified by cancelling all 11 in-flight
animations mid-sequence — h1, legend, lede, the `rule-draw` eraser, five spec rows,
the CTA pair and the title block — nothing is left hidden or displaced.

**Reduced-motion bug fixed.** The universal block zeroed `animation-duration` but
not `animation-delay`. With `animation-fill-mode: backwards` that would have held
the last beat's hidden frame for 440ms and then snapped it in — precisely what the
media query exists to prevent. `animation-delay: 0s !important` and
`transition-delay: 0s !important` were added.

**Second typographic event.** GitHub stat numerals went `text-2xl` →
`text-display-2` (24px → 44px) in mono — the move a datasheet actually makes, and
far enough from the hero that the h1 stays dominant. This also fixed a live defect:
the strip was hardcoded `grid-cols-2 sm:grid-cols-3`, so without `GITHUB_TOKEN` two
stats sat in three columns and the closing hairline stopped at ⅔ width, and with it
the third stat orphaned on mobile and stopped at ½. The column count now follows the
stat count, and mobile is one full-width row per stat.

**Rhythm.** Section padding `py-16 sm:py-20` → `py-12 sm:py-16`, hero and internal
gaps tightened to match. Gaps between consecutive section rules are now an even
96/128 (mobile/`sm`+), with one deliberately larger step out of the masthead.
`Footer.astro`'s `mt-24` is shared by every page and was left alone, so section 03
carries an asymmetric `pb` to compensate — that is why it looks odd in isolation.

`.claude/launch.json` was added so the preview tooling can start the dev server.

## Review pass

A two-axis review (repo standards, and this document as the spec) ran over the whole
branch. What it found, and what changed:

**Two user-facing defects.**

- The hero's `Accessible` note claimed 15:1 text contrast. Corrected to the real
  floor — see the contrast note above. This is the finding that mattered: it was a
  falsifiable claim rendered to visitors that the tokens did not support.
- `Nav.astro`'s mobile panel used `px-5` with no `sm:px-8`, so between 640px and
  767px — where the panel is still visible — its links sat at 20px while the nav bar
  directly above sat at 32px.

**One accessibility regression, from this branch's own focus change.** Removing the
20 `focus-visible:ring-*` combinations changed how focus renders (they were not dead
code — see the corrected note above), and the global rule's `outline-offset: 2px` is
clipped on the resume tabs by `overflow-x-auto` nested in `overflow-hidden`. Fixed
with a `.editor-tab` inset-outline exception in `global.css`, kept there so the
single-source-of-truth rule still holds.

**Two structural cleanups.**

- `MetaList.astro` replaces the slash-separated metadata line that had been written
  out four times. The GitHub repo line benefited most: three optional values with two
  separators, each guarded by whether both its neighbours were present, became a
  `.filter()` over an array. `PostLayout`'s masthead line is deliberately excluded —
  its separator leads each item rather than sitting between them, so covering it
  would take a leading-separator flag and a per-item colour. Two knock-on changes,
  both intended: post tags on `/blog` gain 2px of wrap gap (`gap-y-1` → the
  component's fixed `gap-y-1.5`, visible only when tags wrap onto a second line), and
  a project with an empty `tech` array now emits nothing where it used to emit an
  empty `<ul>`.
- `--spacing-datum` + the `datum-row` utility replace the bare `8rem` literal in five
  grid templates.

**Dead code and fragile branches.** `avatar_url` and `bio` were still declared,
defaulted and resolved on the GitHub profile despite the avatar being a deliberate
removal and the bio never rendering. `statGridClass` branched only on `=== 3`, so a
fourth stat would have silently rendered in two columns. `GitHubSection` hardcoded
`index="03"` while `01` and `02` came from `index.astro`; it now takes the prop.

**Documentation.** `CLAUDE.md` had drifted: it documented `prose-invert` (dropped in
favour of token-driven `.prose`) and listed two custom utilities where there are now
six. It also never recorded the `source(none)` + `@source` scoping, which is a trap —
a new directory's classes are simply never generated. This document had five factual
slips of its own, all corrected in place: the focus-ring mechanism, the contrast
figure, `text-2xl` as 28px (it is 24px), ten in-flight animations (eleven), and the
legend/lede delays as "110ms apart" (110ms and 165ms — 55ms apart).

Verified after: `astro check` clean; the rail lands at identical offsets at 375 /
768 / 1280 to the pre-refactor measurements; no horizontal overflow at any width
from 320px up.

## Left for follow-up

1. **`public/logo.svg` is a yellow-to-magenta gradient.** The magenta stop clashes
   with amber, so `src/components/Logo.astro` renders a `currentColor` monochrome
   version of the same mark. **The original asset is untouched** — this is a brand
   decision, not a page-styling one, so revert by swapping `<Logo />` back for the
   `<img src="/logo.svg">` in `Nav.astro` and `Footer.astro`. A proper fix is a
   two-tone mark designed against this palette.
2. ~~**The GitHub REST calls are unauthenticated.**~~ Addressed in the remediation
   pass below — the REST profile and repository calls are gone entirely.
3. ~~**`public/covers/*.png` are ~3 MB each and unreferenced.**~~ Deleted. They were
   95.4% of the deploy payload. `ProjectCard` still supports the `cover:` field, so
   adding one is a matter of dropping in a compressed image.
4. **Copy is stale in one place.** `src/content/projects/ryanchoi-dev.md` says
   "dark-themed", which understates a site that ships two first-class themes.
   `hello-world.md`'s "accent pink" was corrected in the remediation pass, since
   under the hardline rule it was the site asserting something false about itself.
5. ~~**`ViewTransitions` is deprecated**~~ Now `ClientRouter`; `astro check` is at
   0/0/0. Note the masthead sequence re-runs on every client-side navigation back to
   `/`, because the router swaps in freshly-parsed nodes — that is intended.
6. ~~**Section rhythm at low content volume.**~~ Addressed in the homepage flare
   pass above.
7. **`astro check` does not catch `.astro` template syntax errors.** A JSX comment
   placed inside a `.map()` return passed `astro check` cleanly and only failed at
   build. Run `pnpm build`, not just the check hook, before trusting a template edit.

## Remediation pass — the hardline data rule

A design rule was adopted after the flare pass: **every figure and every number on
the site must represent a verifiable true fact.** No invented data, no placeholders,
no illustrative mockups. Where a fact is unavailable, the row carrying it is dropped —
the rule `src/data/build-info.ts` already followed for the title block.

Auditing the site against that rule found the site was failing it in several places,
all of them in `GitHubSection.astro` and all of them shipping.

**Five fallback constants rendered as fact.** `fallbackProfile` claimed 30
repositories and 15 followers against a truth of 46 and 11. `fallbackRepos` shipped
two cards whose URLs both 404. `fallbackRecentActivity` put the strings `portfolio`
and `client work` in a column of timestamps. These were reached whenever the three
unauthenticated REST calls hit the anonymous limit of 60/hr per IP — not an edge case,
since a build spends three of those 60 every time. All five are deleted.

**"Popular repositories" was false twice over, and removed rather than repaired.**
It queried `sort=stars`, which is not a valid sort for `/users/{user}/repos`; GitHub
silently ignores an unrecognised sort and returns creation order, so the panel headed
"Popular" was in fact "six most recently created". And there was nothing to rank:
every one of the 79 public repositories has zero stars. Worse, four of the six cards
it rendered — `claude-remember`, `openwiki`, `pxpipe`, `Mailspring` — are forks of
other people's projects, presented without attribution as Ryan's own work. The honest
replacement is a commit-volume ranking, which is a figure, not a fix.

**Repositories is now 46, not 79.** The REST `public_repos` field counts forks;
33 of the 79 are other people's projects, so publishing 79 overstated the body of
work by 72%. The GraphQL `repositories(ownerAffiliations: OWNER, isFork: false)`
count is the honest number.

**The contribution total now states its split.** 4,122 of 4,907 contributions —
84% — are `restrictedContributionsCount`, private-repo work. Rendered bare under an
eyebrow reading "Open source", a true number asserted something false. The eyebrow is
now "GitHub" and the split is stated wherever the total appears. The clause drops
itself if the count is zero, which is what a rotated token would produce.

**Language order contradicted the data it came from.** The byte magnitudes were
fetched and then discarded by a `.map(([name]) => name)`, and the surviving order was
reshuffled frontend-first by a `sortByCategory` helper. PHP is the second-largest
language by volume at 21.0% and was displaying seventh. The helper is deleted and the
sort is the true one.

**The contribution grid was 55% saturated.** `getContributionLevel` used GitHub's
classic 0 / 1–3 / 4–6 / 7–9 / 10+ thresholds against a distribution with a median of 6
and a maximum of 98, so 144 of 262 active days pinned at the darkest level and over
half the coloured squares were indistinguishable. Buckets are now quantiles computed
from the response itself, so they cannot drift out of step with it. Measured after:
the four active bands hold 69 / 71 / 58 / 64 days.

**GraphQL failures were structurally invisible.** Only `response.ok` was checked, but
GraphQL answers HTTP 200 with an `errors` array and nulled data on permission and
schema failures — a scope-limited token nulls the entire `user` object and every
element silently vanishes with nothing in the build log. That is exactly the silent
rot the hardline rule exists to prevent, so it now **fails the build**. A network
failure still yields null and drops the rows; absence is honest, invention is not.

**Two attribution bugs.** `event.repo.name.split('/').pop()` stripped the owner, so a
pull request on `Digital-Process-Tools/claude-remember` rendered identically to work
on Ryan's own repo. And `DeleteEvent` was missing from `eventTypeLabels`, so a deleted
branch rendered through the `.replace` path as `Delete ryanchoi.dev`.

**The provenance row named a repository that does not exist.** `HeroSection`
hardcoded `rmerk/ryanchoi-dev`; the remote is `rmerk/ryanchoi.dev`, with a dot. A
false row sat between the two honest git-derived ones.

**The section description described what the component can render, not what it did.**
Without `GITHUB_TOKEN` the language list and contribution grid both drop, and a fixed
string promising them described an empty section. It is now composed from what is
actually present.

**Three REST calls became one GraphQL call.** Repository count, follower count,
contribution calendar, private split and language bytes all come from a single
authenticated request costing one rate-limit point — cheaper than what it replaces
and immune to the anonymous limit that was triggering the fallbacks. REST is now used
only for the activity feed.

`README.md` documented the opposite of the code's behaviour, stating that the
repository cards and REST-derived languages had no hardcoded fallbacks. All three did.
Corrected.

Verified after: `astro check` 0 errors / 0 warnings / 0 hints; build clean; no
horizontal overflow at 320 or 375; both themes render the regraded grid legibly; and
a build with no token drops the stat strip, grid and language list rather than filling
them. `dist` fell from 6,626,010 bytes to 332 KB, the covers having been 95.4% of it.

## Figures — `/resume`, the employment timeline

The remediation pass removed things. This is the first pass that adds one.

The diagnosis behind it: the site had taken a datasheet's *typography* and none of a
datasheet's *graphics*. Zero rendered images, zero illustrative SVG, one accent hue,
24 of 25 hover states a colour swap, and every animation confined to the masthead.
Four of six routes rendered the same label/value list — `/projects` and `/blog` were
literally the same template with one component swapped. What was missing was figures,
and the reason none existed is that the verifiability rule left almost nothing to draw:
a datasheet's figures are drawings of a measurable object, and this document's object
is one person, one blog post and two projects.

`resume.ts` turned out to be the exception — the one dataset on the site that spans a
decade and is fully hermetic. **A fourth editor tab, `timeline`,** renders it. The tab
has no file extension because it is not a source file; it is an editor showing a
rendered view, which is a thing editors do.

| | |
|---|---|
| Grouping | **Employer bars, subdivided by role.** Consecutive entries at one company are one tenure — Total Expert is a single 65-month bar with the promotion drawn as an internal division, not two jobs. Keyed on company there are four bars; keyed on role, five. Both are true and they are different figures; this picks one deliberately and puts the five roles in a legend beneath |
| Gaps | **Drawn, not closed up.** Jun–Oct 2021 (4 months) and Jun–Sep 2022 (3 months) are real, and a seamless career bar would be the invention |
| The divider | An eraser in `--color-bg` over the bar, the same technique as `rule-draw`. A gap between two bars would read as two jobs; an erased hairline reads as one tenure with a change inside it |
| `Present` | Resolves to the build month and **says so on the figure**. The ongoing bar otherwise accrues tenure forever if `resume.ts` is never updated — the probe's exact warning. Self-dating turns silent inflation into a visible staleness signal |
| Markup | A real `<table>`, not SVG. The rows are tabular — employer, period, duration — so the accessible reading is the useful one, text stays selectable, and both themes come free from the token variables. Only the bar geometry is drawn |

**Parsing is strict.** `resume.ts` stays hand-authored prose (`'June 2024'` in
`experience`, the abbreviated `'Nov 2015'` in `education`), and `timeline.ts` is the
only module that interprets it. An unparseable date, an unknown month name, or an end
before its start throws at build time. A timeline quietly missing a role is a worse
failure than one that does not build.

**Three bugs found while building it, two of them pre-existing:**

- **`sr-only` on a `<th>` collapses the column model.** The class is
  `position: absolute`, so header cells carrying it leave the flow and
  `table-layout: fixed` has no first row to take widths from — the track rendered at
  a third of its width. The labels are now `.sr-only` *spans inside* cells that keep
  their layout classes.
- **`display: block` on `tr`/`th`/`td` but not `thead`.** At mobile widths the browser
  wrapped the still-`table-header-group` thead in an anonymous table box, collapsing
  the axis to content width and stacking all eleven year labels on top of each other.
  The bars looked correct because `tbody` *was* converted, which is what made it hard
  to see.
- **The minimap was duplicating every `id` in the document** (pre-existing). It clones
  `#editor-content` wholesale, so the page carried two each of `#editor-content`,
  `#experience`, `#skills` and `#education`. The clone is now stripped of ids.

Also fixed, pre-existing: the status bar rendered one static line count for every tab —
the last section's, so it was wrong on three tabs out of four. It now counts the open
document, and the timeline, which has no lines, declares its own status instead.

Gridlines are positioned spans rather than a `repeating-linear-gradient`: percentage
`background-position` resolves against (container − image), which is zero when the
image fills the box, so a gradient cannot be offset to a first tick that is not at 0%.
The spans take the same percentages the bars do and cannot drift out of alignment.

Verified after: `astro check` 0/0/0; every rendered offset reproduces the arithmetic
independently (Total Expert 65 months at 51.59% of 126, the promotion dividing at
75.4% of that bar, gaps at 3.17% and 2.38%, Equifax current at 19.84%); no duplicate
ids in the built HTML; no overflow at 375; bar fills measure 5.32:1 and 5.77:1 against
the editor surface in light, clear of the 3:1 floor for graphical objects.

## Figures — `/`, the GitHub panel

Three figures, all built from data the single GraphQL request was already fetching or
could fetch for the same one rate-limit point. Nothing here needed a new credential,
a new service, or a second round trip.

**Language composition.** A proportional strip over 24.9 MB across 21 languages, five
named and the rest pooled. The byte magnitudes were always in the response; the old
code discarded them with `.map(([name]) => name)` and then reshuffled the survivors
frontend-first, so the rendered order contradicted the data it came from. Stated
plainly: HTML 24.6%, **PHP 21.0%**, TypeScript 15.8%, Vue 12.5%, JavaScript 9.3%, and
16 more at 16.8%. PHP being the second-largest thing Ryan has written, and appearing
nowhere in the site's own stack list, is the most interesting fact the API had.

**Contributions by year.** Six years, stacked public over private: 21, 86, 11, 67,
1,478, 3,819. Drawn on a **linear** scale even though two orders of magnitude separate
2023 from 2026 — the near-invisibility of the early bars is the finding, and a log
scale would flatten the only thing this figure has to say. A 2px segment minimum keeps
a real year from rendering as nothing at all, and the current year is labelled `YTD`
because an unlabelled final bar reads as a collapse every January.

Stacking by public/private solved two problems with one figure. It absorbed the
standalone split figure, and it puts the 84%-private fact where the volume claim is
made rather than in a footnote beside it.

**Commits by repository.** game-night 277, ryanchoi.dev 132, dictate 71,
crewai-headless-flow 70, meal-plans 57. This is the honest replacement for the removed
"Popular repositories" panel: stars are zero across all 79 public repositories and rank
nothing, while commit volume has real variance. Private repositories are dropped rather
than redacted — a row reading "private repository" is a shape with no fact in it, and
the count alone would still leak activity volume.

| | |
|---|---|
| Markup | `FigureBars.astro` and `FigureStrip.astro`, both real tables/lists with CSS-drawn geometry. No SVG and no charting library: the rows are tabular, so the accessible reading is the useful one, and "no client-side UI framework" stays true |
| Palette | One descending warm ramp — accent, accent-secondary, code-string, muted, muted-soft, tail in border-strong. `--color-code-type` was tried and dropped: the sage green works as syntax highlighting in the resume editor and reads as a foreign design language here |
| Separation | A 1px hairline in `--color-bg` between adjacent segments, so each fill only has to clear 3:1 against the background rather than against its neighbour. Measured: dark 8.72 / 10.95 / 8.39 / 8.53 / 5.27 / 3.07, light 5.42 / 8.13 / 6.04 / 7.14 / 5.00 / 3.38 |
| Attribution | Repository rows strip the owner prefix only when it is Ryan's own, so another person's repository can never render as his. Same rule the activity feed enforces |

**The `sr-only`-on-`<th>` trap, again.** `FigureBars` hit the identical bug the Gantt
did — header cells carrying `sr-only` are `position: absolute`, leave the flow, and
leave `table-layout: fixed` with no first row to size columns from. Both components now
put the label in a span *inside* a cell that keeps its layout class. Worth stating as a
rule: **never put `sr-only` on a `<th>` or `<td>`; put it on a span inside.**

Verified after: `astro check` 0/0/0; every rendered percentage reproduces from the raw
byte and contribution counts; a build with no `GITHUB_TOKEN` drops all three figures
along with the stat strip and grid, and the section description recomposes to name only
what is left; no horizontal overflow at 375; both themes measured above.
