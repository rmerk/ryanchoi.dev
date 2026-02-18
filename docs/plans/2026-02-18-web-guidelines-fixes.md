# Web Interface Guidelines Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all issues found during the Web Interface Guidelines audit — accessibility, focus states, motion, theming, and layout shift.

**Architecture:** Pure CSS/HTML fixes across 7 existing files. No new components or dependencies. Each task targets one concern across all affected files.

**Tech Stack:** Astro 5, Tailwind CSS v4, HTML/ARIA

---

### Task 1: Add `color-scheme`, `<meta name="theme-color">`, and skip-to-content link

**Files:**
- Modify: `src/layouts/BaseLayout.astro:16-46`
- Modify: `src/styles/global.css:20-25`

**Step 1: Add `color-scheme` to global CSS**

In `src/styles/global.css`, add `color-scheme: dark;` to the `html` rule and `color-scheme: light;` to the `html.light` rule:

```css
html {
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
  color-scheme: dark;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}
```

```css
html.light {
  color-scheme: light;
  --color-bg: #f5f5f3;
  /* ... rest unchanged */
}
```

**Step 2: Add `<meta name="theme-color">` and skip link to BaseLayout**

In `src/layouts/BaseLayout.astro`, add two `<meta name="theme-color">` tags (one for dark, one for light via media query) after the viewport meta, and a skip-to-content link before `<Nav />`:

```html
<meta name="theme-color" content="#0e0e10" media="(prefers-color-scheme: dark)" />
<meta name="theme-color" content="#f5f5f3" media="(prefers-color-scheme: light)" />
```

Add skip link as first child of `<body>`:

```html
<body class="min-h-screen flex flex-col">
  <a href="#main-content" class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-accent focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:text-sm focus:font-mono">
    Skip to content
  </a>
  <Nav />
  <main id="main-content" class="flex-1">
```

**Step 3: Build and verify**

Run: `pnpm build`
Expected: No errors. View source should show meta tags and skip link.

**Step 4: Commit**

```bash
git add src/layouts/BaseLayout.astro src/styles/global.css
git commit -m "fix: add color-scheme, theme-color meta, and skip-to-content link"
```

---

### Task 2: Add focus-visible styles to Nav links and Footer social links

**Files:**
- Modify: `src/components/Nav.astro:29-38` (nav links)
- Modify: `src/components/Nav.astro:42-52` (GitHub icon link)
- Modify: `src/components/Nav.astro:55-65` (LinkedIn icon link)
- Modify: `src/components/Footer.astro:22-32` (GitHub icon link)
- Modify: `src/components/Footer.astro:33-43` (LinkedIn icon link)

**Step 1: Add focus styles to nav links**

In `src/components/Nav.astro`, add `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm` to the nav link class string (line 31):

```astro
<a
  href={href}
  class={`font-mono text-sm transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
    currentPath === href || (href !== '/' && currentPath.startsWith(href))
      ? 'text-accent'
      : 'text-muted hover:text-text'
  }`}
>
```

**Step 2: Add focus styles to Nav icon links (GitHub + LinkedIn)**

Add `rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent` to both icon link class strings at lines 46 and 59:

GitHub (line 46):
```
class="text-muted hover:text-text transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
```

LinkedIn (line 59):
```
class="text-muted hover:text-text transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
```

**Step 3: Add focus styles to Footer social links**

Same pattern for Footer.astro lines 26 and 37:

GitHub (line 26):
```
class="text-muted hover:text-text transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
```

LinkedIn (line 37):
```
class="text-muted hover:text-text transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
```

**Step 4: Build and verify**

Run: `pnpm build`
Expected: No errors. Tab through nav — all links show accent ring on focus.

**Step 5: Commit**

```bash
git add src/components/Nav.astro src/components/Footer.astro
git commit -m "fix: add focus-visible ring to nav links and footer social links"
```

---

### Task 3: Add focus-visible styles to Hero CTA buttons

**Files:**
- Modify: `src/components/HeroSection.astro:62-77`

**Step 1: Add focus ring to "View Work" CTA**

At line 64, change:
```
class="inline-flex items-center gap-2 text-white text-sm font-medium px-6 py-3 rounded-md transition-all hover:opacity-90 hover:shadow-lg hover:shadow-glow/25"
```
to:
```
class="inline-flex items-center gap-2 text-white text-sm font-medium px-6 py-3 rounded-md transition-[opacity,box-shadow] hover:opacity-90 hover:shadow-lg hover:shadow-glow/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
```

(Also fixes the `transition-all` anti-pattern by switching to explicit properties.)

**Step 2: Add focus ring to "Resume" CTA**

At line 74, change:
```
class="hero-pill inline-flex items-center gap-2 border border-text/20 text-text text-sm font-medium px-6 py-3 rounded-md hover:border-text/40 transition-colors"
```
to:
```
class="hero-pill inline-flex items-center gap-2 border border-text/20 text-text text-sm font-medium px-6 py-3 rounded-md hover:border-text/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
```

**Step 3: Build and verify**

Run: `pnpm build`
Expected: No errors.

**Step 4: Commit**

```bash
git add src/components/HeroSection.astro
git commit -m "fix: add focus-visible ring to hero CTA buttons, replace transition-all"
```

---

### Task 4: Fix `<img>` missing `width`/`height` and `transition-all` in ProjectCard

**Files:**
- Modify: `src/components/ProjectCard.astro:15` (article transition)
- Modify: `src/components/ProjectCard.astro:19-24` (img element)

**Step 1: Replace `transition-all` on article**

At line 15, change:
```
class="group relative flex flex-col border border-border bg-surface rounded-lg overflow-hidden transition-all duration-200 hover:border-accent/50 hover:shadow-lg hover:shadow-glow/10"
```
to:
```
class="group relative flex flex-col border border-border bg-surface rounded-lg overflow-hidden transition-[border-color,box-shadow] duration-200 hover:border-accent/50 hover:shadow-lg hover:shadow-glow/10"
```

**Step 2: Add `width` and `height` to `<img>`**

At line 19-24, change:
```html
<img
  src={cover}
  alt=""
  class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
  loading="lazy"
/>
```
to:
```html
<img
  src={cover}
  alt=""
  width="640"
  height="360"
  class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
  loading="lazy"
/>
```

(Aspect ratio doesn't matter here because CSS `w-full h-full object-cover` overrides — but explicit dimensions prevent layout shift.)

**Step 3: Build and verify**

Run: `pnpm build`
Expected: No errors.

**Step 4: Commit**

```bash
git add src/components/ProjectCard.astro
git commit -m "fix: add img dimensions and replace transition-all in ProjectCard"
```

---

### Task 5: Guard `animate-ping` with `prefers-reduced-motion`

**Files:**
- Modify: `src/styles/global.css` (add reduced-motion rule)

**Step 1: Add reduced-motion guard for animate-ping**

In `src/styles/global.css`, inside the existing `@media (prefers-reduced-motion: reduce)` block (line 27-31), add a rule to disable animate-ping:

```css
@media (prefers-reduced-motion: reduce) {
  html {
    transition: none;
  }
  .animate-ping {
    animation: none;
  }
}
```

This catches all uses of `animate-ping` across HeroSection (line 37) and index.astro (lines 33, 63).

**Step 2: Build and verify**

Run: `pnpm build`
Expected: No errors.

**Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "fix: disable animate-ping for prefers-reduced-motion"
```

---

### Task 6: Add `text-wrap: balance` to headings

**Files:**
- Modify: `src/components/HeroSection.astro:44` (h1)
- Modify: `src/components/HeroSection.astro:51` (subtitle)
- Modify: `src/pages/projects.astro:13` (h1)

**Step 1: Add `text-wrap: balance` to hero heading**

At line 44 of HeroSection.astro, change:
```
class="text-6xl md:text-8xl font-bold leading-tight tracking-tight mb-4"
```
to:
```
class="text-6xl md:text-8xl font-bold leading-tight tracking-tight mb-4 text-balance"
```

**Step 2: Add to hero subtitle**

At line 51, change:
```
class="text-xl md:text-2xl hero-subtitle mb-6"
```
to:
```
class="text-xl md:text-2xl hero-subtitle mb-6 text-balance"
```

**Step 3: Add to projects page heading**

At line 13 of projects.astro, change:
```
class="text-3xl font-bold text-text mb-2"
```
to:
```
class="text-3xl font-bold text-text mb-2 text-balance"
```

**Step 4: Build and verify**

Run: `pnpm build`
Expected: No errors.

**Step 5: Commit**

```bash
git add src/components/HeroSection.astro src/pages/projects.astro
git commit -m "fix: add text-wrap balance to headings"
```

---

### Task 7: Add mobile hamburger menu to Nav

**Files:**
- Modify: `src/components/Nav.astro`

**Step 1: Hide desktop links on mobile, add hamburger button**

Replace the `<!-- Links -->` div (line 27-91) with a mobile-responsive version. The desktop links get `hidden md:flex`, and a hamburger button is added for mobile:

```astro
<!-- Desktop links -->
<div class="hidden md:flex items-center gap-6">
  {navLinks.map(({ href, label }) => (
    <a
      href={href}
      class={`font-mono text-sm transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
        currentPath === href || (href !== '/' && currentPath.startsWith(href))
          ? 'text-accent'
          : 'text-muted hover:text-text'
      }`}
    >
      {label}
    </a>
  ))}

  <!-- GitHub -->
  <a
    href="https://github.com/rmerk"
    target="_blank"
    rel="noopener noreferrer"
    class="text-muted hover:text-text transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    aria-label="GitHub"
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
    </svg>
  </a>

  <!-- LinkedIn -->
  <a
    href="https://www.linkedin.com/in/ryanchoimn/"
    target="_blank"
    rel="noopener noreferrer"
    class="text-muted hover:text-text transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    aria-label="LinkedIn"
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  </a>

  <!-- Theme toggle -->
  <button
    id="theme-toggle"
    type="button"
    aria-label="Toggle light/dark mode"
    class="text-muted hover:text-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
  >
    <svg id="icon-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
    <svg id="icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  </button>
</div>

<!-- Mobile: theme toggle + hamburger -->
<div class="flex items-center gap-3 md:hidden">
  <button
    id="theme-toggle-mobile"
    type="button"
    aria-label="Toggle light/dark mode"
    class="text-muted hover:text-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
  >
    <svg class="icon-sun-m" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
    <svg class="icon-moon-m" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  </button>
  <button
    id="mobile-menu-btn"
    type="button"
    aria-label="Open menu"
    aria-expanded="false"
    class="text-muted hover:text-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
  >
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  </button>
</div>
```

**Step 2: Add mobile dropdown panel after `</nav>`**

Insert between `</nav>` and `</header>`:

```html
<!-- Mobile menu panel -->
<div id="mobile-menu" class="hidden md:hidden border-t border-border/50 bg-bg/95 backdrop-blur-md">
  <div class="flex flex-col px-6 py-4 gap-3">
    {navLinks.map(({ href, label }) => (
      <a
        href={href}
        class={`font-mono text-sm py-1 transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
          currentPath === href || (href !== '/' && currentPath.startsWith(href))
            ? 'text-accent'
            : 'text-muted hover:text-text'
        }`}
      >
        {label}
      </a>
    ))}
    <div class="flex gap-4 pt-2 border-t border-border/50">
      <a href="https://github.com/rmerk" target="_blank" rel="noopener noreferrer" class="text-muted hover:text-text transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent" aria-label="GitHub">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
      </a>
      <a href="https://www.linkedin.com/in/ryanchoimn/" target="_blank" rel="noopener noreferrer" class="text-muted hover:text-text transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent" aria-label="LinkedIn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
      </a>
    </div>
  </div>
</div>
```

**Step 3: Add mobile menu CSS visibility rules**

In `src/styles/global.css`, add after the existing theme toggle icon rules (line 47):

```css
/* Mobile theme toggle icon visibility */
.icon-moon-m { display: none; }
html.light .icon-moon-m { display: block; }
html.light .icon-sun-m { display: none; }
```

**Step 4: Update the `<script>` to handle mobile menu and mobile theme toggle**

Replace the entire `<script>` block in Nav.astro with:

```ts
function initThemeToggle() {
  const btns = [document.getElementById('theme-toggle'), document.getElementById('theme-toggle-mobile')];
  btns.forEach(btn => {
    btn?.addEventListener('click', () => {
      const isLight = document.documentElement.classList.toggle('light');
      try { localStorage.setItem('theme', isLight ? 'light' : 'dark'); } catch (_) {}
    });
  });

  const menuBtn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  menuBtn?.addEventListener('click', () => {
    const expanded = menu?.classList.toggle('hidden') === false;
    menuBtn.setAttribute('aria-expanded', String(expanded));
    menuBtn.setAttribute('aria-label', expanded ? 'Close menu' : 'Open menu');
  });
}

initThemeToggle();

if (!(window as any).__themeSwapListenerSet) {
  (window as any).__themeSwapListenerSet = true;
  document.addEventListener('astro:after-swap', initThemeToggle);
}
```

**Step 5: Build and verify**

Run: `pnpm build`
Expected: No errors. Resize browser below `md` breakpoint — hamburger appears, menu toggles.

**Step 6: Commit**

```bash
git add src/components/Nav.astro src/styles/global.css
git commit -m "feat: add responsive mobile hamburger menu to nav"
```

---

### Task 8: Final build verification

**Step 1: Full build**

Run: `pnpm build`
Expected: Clean build, no TypeScript errors.

**Step 2: Visual spot-check**

Run: `pnpm preview`
Check:
- Tab through all interactive elements — accent ring visible on focus
- Resize to mobile — hamburger menu works
- Toggle theme — both modes look correct
- Skip link appears on first Tab press
- Check browser tab color matches page background

**Step 3: Commit (if any missed changes)**

```bash
git status
# Stage any remaining files
```
