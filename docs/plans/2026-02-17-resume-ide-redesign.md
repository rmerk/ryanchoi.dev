# Resume IDE Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the resume page as a VS Code-style editor window rendering career data as syntax-highlighted TypeScript.

**Architecture:** The resume page (`src/pages/resume.astro`) is a complete rewrite. The existing data source (`src/data/resume.ts`) is consumed unchanged. All content renders inside an editor chrome wrapper (title bar, tab bar, line-numbered code area, minimap, status bar). Syntax highlighting is done with Tailwind utility classes. A tiny inline script handles active tab tracking via IntersectionObserver.

**Tech Stack:** Astro 5, Tailwind CSS v4, TypeScript, no new dependencies

**Design doc:** `docs/plans/2026-02-17-resume-ide-redesign-design.md`

---

### Task 1: Editor Chrome Shell

**Files:**
- Modify: `src/pages/resume.astro` (complete rewrite)

**Step 1: Write the editor chrome skeleton**

Replace the entire contents of `src/pages/resume.astro` with the editor shell — title bar, tab bar, empty content area, and status bar. No actual resume content yet, just the chrome.

```astro
---
// src/pages/resume.astro
import BaseLayout from '@/layouts/BaseLayout.astro';
import { experience, education, skills } from '@/data/resume';
---

<BaseLayout title="Resume" description="Ryan Choi's work experience and skills">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 py-16">
    <!-- Editor window -->
    <div class="border border-border rounded-lg overflow-hidden bg-surface shadow-lg">

      <!-- Title bar -->
      <div class="flex items-center px-4 py-2.5 bg-surface border-b border-border">
        <div class="flex gap-1.5 mr-4">
          <span class="w-3 h-3 rounded-full bg-[#ff5f57]" aria-hidden="true"></span>
          <span class="w-3 h-3 rounded-full bg-[#febc2e]" aria-hidden="true"></span>
          <span class="w-3 h-3 rounded-full bg-[#28c840]" aria-hidden="true"></span>
        </div>
        <span class="flex-1 text-center font-mono text-xs text-muted">resume.ts — ryanchoi.dev</span>
        <div class="w-[54px]"></div> <!-- Spacer to center title -->
      </div>

      <!-- Tab bar -->
      <div class="flex overflow-x-auto border-b border-border bg-bg" role="tablist">
        <a href="#experience" class="editor-tab active-tab font-mono text-xs px-4 py-2 border-r border-border whitespace-nowrap" data-tab="experience">
          experience.ts
        </a>
        <a href="#skills" class="editor-tab font-mono text-xs px-4 py-2 border-r border-border whitespace-nowrap" data-tab="skills">
          skills.ts
        </a>
        <a href="#education" class="editor-tab font-mono text-xs px-4 py-2 border-r border-border whitespace-nowrap" data-tab="education">
          education.ts
        </a>
      </div>

      <!-- Editor body -->
      <div class="flex">
        <!-- Line numbers + content -->
        <div class="flex-1 min-w-0 overflow-x-auto">
          <div class="font-mono text-sm sm:text-sm text-xs leading-relaxed p-4">
            <!-- Content goes here in Task 2-4 -->
            <p class="text-muted italic">// TODO: content</p>
          </div>
        </div>

        <!-- Minimap (desktop only) -->
        <div class="hidden lg:block w-20 border-l border-border bg-bg/50 relative overflow-hidden" aria-hidden="true">
          <div id="minimap-content" class="absolute top-0 left-0 w-[540px] origin-top-left pointer-events-none" style="transform: scale(0.148); filter: blur(0.5px); opacity: 0.5;"></div>
        </div>
      </div>

      <!-- Status bar -->
      <div class="flex items-center justify-between px-4 py-1.5 bg-surface border-t border-border font-mono text-[11px] text-muted">
        <div class="flex items-center gap-3">
          <span class="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <circle cx="12" cy="12" r="3"/><line x1="12" y1="1" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/>
            </svg>
            <span class="text-accent">main</span>
          </span>
        </div>
        <div class="flex items-center gap-3">
          <span class="hidden sm:inline">
            <span class="text-green-400">✓</span> TypeScript
          </span>
          <span class="hidden sm:inline">UTF-8</span>
          <span class="hidden sm:inline">Ln 1, Col 1</span>
        </div>
      </div>

    </div>
  </div>
</BaseLayout>
```

**Step 2: Verify the chrome renders**

Run: `pnpm astro check`
Expected: No TypeScript errors.

Then open `http://localhost:4321/resume` in the browser. You should see:
- A rounded editor window with title bar (three colored dots, centered filename)
- Three tabs (experience.ts, skills.ts, education.ts)
- An empty content area with `// TODO: content`
- A status bar with branch and TypeScript info

**Step 3: Commit**

```bash
git add src/pages/resume.astro
git commit -m "feat(resume): add VS Code editor chrome shell"
```

---

### Task 2: Line Number Helper

**Files:**
- Modify: `src/pages/resume.astro`

We need a mechanism to render continuous line numbers alongside code lines. Since this is a static site, we'll use a CSS-based approach: each line is a `<div>` with a `data-line` attribute, and CSS `::before` renders the number.

**Step 1: Add the line rendering styles**

Add a `<style>` block at the bottom of `resume.astro`:

```astro
<style>
  .code-line {
    display: flex;
    min-height: 1.5em;
  }
  .code-line::before {
    content: attr(data-line);
    width: 3rem;
    text-align: right;
    padding-right: 1rem;
    color: var(--color-muted);
    opacity: 0.5;
    user-select: none;
    flex-shrink: 0;
  }
  @media (max-width: 640px) {
    .code-line::before {
      width: 2rem;
      padding-right: 0.5rem;
      font-size: 0.65rem;
    }
  }
</style>
```

**Step 2: Add a few test lines to verify**

Replace the `// TODO: content` placeholder with:

```astro
<div class="code-line" data-line="1"><span class="text-muted italic">// Experience</span></div>
<div class="code-line" data-line="2"><span>&nbsp;</span></div>
<div class="code-line" data-line="3">
  <span><span class="text-accent">const</span> <span>experience</span><span class="text-muted">:</span> <span class="text-accent-secondary">Role</span><span class="text-muted">[] = [</span></span>
</div>
```

**Step 3: Verify line numbers render**

Run: `pnpm astro check`
Expected: No errors.

Check `http://localhost:4321/resume` — you should see numbered lines with syntax-colored code.

**Step 4: Commit**

```bash
git add src/pages/resume.astro
git commit -m "feat(resume): add line number rendering system"
```

---

### Task 3: Experience Section Content

**Files:**
- Modify: `src/pages/resume.astro`

**Step 1: Build the experience section**

Replace the test lines from Task 2 with the full experience section. Use a counter variable in the Astro frontmatter to track line numbers. The section renders each job from the `experience` array as a TypeScript object literal.

In the frontmatter, add a line counter:

```astro
let line = 0;
const ln = () => String(++line);
```

Then in the content area, render the experience section. Each job maps to a block like:

```astro
<section id="experience">
  <div class="code-line" data-line={ln()}><span class="text-muted italic">// ═══════════════════════════════════════</span></div>
  <div class="code-line" data-line={ln()}><span class="text-muted italic">// Experience</span></div>
  <div class="code-line" data-line={ln()}><span class="text-muted italic">// ═══════════════════════════════════════</span></div>
  <div class="code-line" data-line={ln()}><span>&nbsp;</span></div>
  <div class="code-line" data-line={ln()}>
    <span><span class="text-accent">const</span> experience<span class="text-muted">:</span> <span class="text-accent-secondary">Role</span><span class="text-muted">[] = [</span></span>
  </div>

  {experience.map((job, i) => (
    <>
      <div class="code-line" data-line={ln()}><span class="text-muted">  {'{'}</span></div>
      <div class="code-line" data-line={ln()}>
        <span>    role<span class="text-muted">:</span> <span class="text-green-400">"{job.role}"</span><span class="text-muted">,</span></span>
      </div>
      <div class="code-line" data-line={ln()}>
        <span>    company<span class="text-muted">:</span> <a href={job.url} target="_blank" rel="noopener noreferrer" class="text-accent hover:underline">"{job.company}"</a><span class="text-muted">,</span></span>
      </div>
      <div class="code-line" data-line={ln()}>
        <span>    period<span class="text-muted">:</span> <span class="text-green-400">"{job.start} → {job.end}"</span><span class="text-muted">,</span></span>
      </div>
      <div class="code-line" data-line={ln()}>
        <span>    highlights<span class="text-muted">: [</span></span>
      </div>
      {job.bullets.map((bullet) => (
        <div class="code-line" data-line={ln()}>
          <span>      <span class="text-green-400">"{bullet}"</span><span class="text-muted">,</span></span>
        </div>
      ))}
      <div class="code-line" data-line={ln()}><span class="text-muted">    ],</span></div>
      <div class="code-line" data-line={ln()}><span class="text-muted">  {'}'},</span></div>
      {i < experience.length - 1 && (
        <div class="code-line" data-line={ln()}><span>&nbsp;</span></div>
      )}
    </>
  ))}

  <div class="code-line" data-line={ln()}><span class="text-muted">];</span></div>
</section>
```

**Note:** The `ln()` function is called at build time, so line numbers are sequential and baked into the static HTML. Each call increments the counter.

**Step 2: Verify experience renders**

Run: `pnpm astro check`
Expected: No errors.

Check `http://localhost:4321/resume` — you should see all 5 jobs rendered as TypeScript objects with proper syntax coloring, continuous line numbers, and clickable company links.

**Step 3: Commit**

```bash
git add src/pages/resume.astro
git commit -m "feat(resume): render experience section as TypeScript objects"
```

---

### Task 4: Skills & Education Sections

**Files:**
- Modify: `src/pages/resume.astro`

**Step 1: Add skills section after experience**

Continue using the `ln()` counter. Add a blank line separator, then render skills as a type definition:

```astro
<div class="code-line" data-line={ln()}><span>&nbsp;</span></div>

<section id="skills">
  <div class="code-line" data-line={ln()}><span class="text-muted italic">// ═══════════════════════════════════════</span></div>
  <div class="code-line" data-line={ln()}><span class="text-muted italic">// Skills</span></div>
  <div class="code-line" data-line={ln()}><span class="text-muted italic">// ═══════════════════════════════════════</span></div>
  <div class="code-line" data-line={ln()}><span>&nbsp;</span></div>
  <div class="code-line" data-line={ln()}>
    <span><span class="text-accent">type</span> <span class="text-accent-secondary">Stack</span> <span class="text-muted">= {'{'}</span></span>
  </div>

  {Object.entries(skills).map(([category, items]) => (
    <div class="code-line" data-line={ln()}>
      <span>  {category.toLowerCase()}<span class="text-muted">:</span> <span class="text-muted">[</span>{items.map((item, i) => <><span class="text-green-400">"{item}"</span>{i < items.length - 1 && <span class="text-muted">, </span>}</> )}<span class="text-muted">],</span></span>
    </div>
  ))}

  <div class="code-line" data-line={ln()}><span class="text-muted">{'}'};</span></div>
</section>
```

**Step 2: Add education section after skills**

```astro
<div class="code-line" data-line={ln()}><span>&nbsp;</span></div>

<section id="education">
  <div class="code-line" data-line={ln()}><span class="text-muted italic">// ═══════════════════════════════════════</span></div>
  <div class="code-line" data-line={ln()}><span class="text-muted italic">// Education</span></div>
  <div class="code-line" data-line={ln()}><span class="text-muted italic">// ═══════════════════════════════════════</span></div>
  <div class="code-line" data-line={ln()}><span>&nbsp;</span></div>

  {education.map((edu) => (
    <>
      <div class="code-line" data-line={ln()}>
        <span><span class="text-accent">const</span> education <span class="text-muted">= {'{'}</span></span>
      </div>
      <div class="code-line" data-line={ln()}>
        <span>  credential<span class="text-muted">:</span> <span class="text-green-400">"{edu.credential}"</span><span class="text-muted">,</span></span>
      </div>
      <div class="code-line" data-line={ln()}>
        <span>  institution<span class="text-muted">:</span> <a href={edu.url} target="_blank" rel="noopener noreferrer" class="text-accent hover:underline">"{edu.institution}"</a><span class="text-muted">,</span></span>
      </div>
      <div class="code-line" data-line={ln()}>
        <span>  period<span class="text-muted">:</span> <span class="text-green-400">"{edu.start} → {edu.end}"</span><span class="text-muted">,</span></span>
      </div>
      <div class="code-line" data-line={ln()}><span class="text-muted">{'}'};</span></div>
    </>
  ))}
</section>
```

**Step 3: Verify all sections render**

Run: `pnpm astro check`
Expected: No errors.

Check `http://localhost:4321/resume` — all three sections should render with continuous line numbers. Clicking tabs should scroll to each section.

**Step 4: Commit**

```bash
git add src/pages/resume.astro
git commit -m "feat(resume): add skills and education sections"
```

---

### Task 5: Active Tab Script & Tab Styles

**Files:**
- Modify: `src/pages/resume.astro`

**Step 1: Add tab styling to the `<style>` block**

Append to the existing `<style>` block:

```css
.editor-tab {
  color: var(--color-muted);
  border-bottom: 2px solid transparent;
  background: var(--color-bg);
  transition: color 0.15s, border-color 0.15s, background-color 0.15s;
}
.editor-tab:hover {
  color: var(--color-text);
}
.editor-tab.active-tab {
  color: var(--color-text);
  border-bottom-color: var(--color-accent);
  background: var(--color-surface);
}
```

**Step 2: Add the IntersectionObserver script**

Add this inline script at the bottom of the file, before the closing `</BaseLayout>`:

```astro
<script>
  function setupTabTracking() {
    const sections = document.querySelectorAll<HTMLElement>('#experience, #skills, #education');
    const tabs = document.querySelectorAll<HTMLAnchorElement>('.editor-tab');

    if (!sections.length || !tabs.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            tabs.forEach((tab) => {
              tab.classList.toggle('active-tab', tab.dataset.tab === id);
            });
          }
        });
      },
      { rootMargin: '-20% 0px -60% 0px' }
    );

    sections.forEach((section) => observer.observe(section));
  }

  setupTabTracking();
  document.addEventListener('astro:after-swap', setupTabTracking);
</script>
```

**Step 3: Verify tab tracking**

Run: `pnpm astro check`
Expected: No errors.

Check `http://localhost:4321/resume` — scroll through the page. The active tab should highlight as each section enters the viewport. Click a tab — it should scroll to that section and become active.

**Step 4: Commit**

```bash
git add src/pages/resume.astro
git commit -m "feat(resume): add active tab tracking with IntersectionObserver"
```

---

### Task 6: Minimap

**Files:**
- Modify: `src/pages/resume.astro`

**Step 1: Implement the minimap**

The minimap is a scaled-down, blurred duplicate of the code content. Give the content area an `id="editor-content"`, then use a small inline script to clone it into the minimap container using `cloneNode(true)` (safe DOM method, no innerHTML).

Add `id="editor-content"` to the content wrapper div (the one containing all the `code-line` divs).

Then update the minimap container to:

```astro
<!-- Minimap (desktop only) -->
<div class="hidden lg:block w-20 border-l border-border bg-bg/50 relative overflow-hidden" aria-hidden="true">
  <div id="minimap-content" class="absolute top-0 left-0 w-[540px] origin-top-left pointer-events-none" style="transform: scale(0.148); filter: blur(0.5px); opacity: 0.5;"></div>
</div>
```

Add to the script block (alongside `setupTabTracking`):

```javascript
function setupMinimap() {
  const source = document.getElementById('editor-content');
  const target = document.getElementById('minimap-content');
  if (source && target) {
    target.replaceChildren(source.cloneNode(true));
  }
}

setupMinimap();
document.addEventListener('astro:after-swap', setupMinimap);
```

**Step 2: Verify minimap renders**

Run: `pnpm astro check`
Expected: No errors.

Check `http://localhost:4321/resume` on a desktop-width viewport. The right column should show a tiny, blurred replica of the code content. On mobile, it should be hidden.

**Step 3: Commit**

```bash
git add src/pages/resume.astro
git commit -m "feat(resume): add decorative minimap column"
```

---

### Task 7: Responsive Polish & Final Touches

**Files:**
- Modify: `src/pages/resume.astro`

**Step 1: Add responsive refinements**

Review and adjust:

1. **Status bar line count** — update the hardcoded `Ln 1, Col 1` to use the actual total line count:
   In the frontmatter, after all sections, the `line` variable holds the total. Pass it to the status bar:
   ```astro
   <span class="hidden sm:inline">Ln {line}, Col 1</span>
   ```

2. **Mobile font sizing** — ensure the content div has responsive text:
   ```
   class="font-mono text-xs sm:text-sm leading-relaxed p-4"
   ```

3. **Tab scroll on mobile** — add `scrollbar-hide` class or hide scrollbar:
   Add to `<style>`:
   ```css
   .tab-scroll::-webkit-scrollbar { display: none; }
   .tab-scroll { -ms-overflow-style: none; scrollbar-width: none; }
   ```
   Add `tab-scroll` class to the tab bar container.

4. **Long bullet text** — ensure long strings wrap properly inside code lines:
   ```css
   .code-line > span {
     white-space: pre-wrap;
     word-break: break-word;
   }
   ```

**Step 2: Verify on mobile and desktop**

Run: `pnpm astro check`
Expected: No errors.

Test at both mobile (375px) and desktop (1280px) widths:
- Mobile: no horizontal overflow, tabs scrollable, minimap hidden, text readable
- Desktop: full editor chrome visible, minimap showing, proper spacing

**Step 3: Commit**

```bash
git add src/pages/resume.astro
git commit -m "feat(resume): responsive polish and final adjustments"
```

---

### Task 8: Visual QA in Browser

**Files:** None (verification only)

**Step 1: Full visual check**

Open `http://localhost:4321/resume` and verify:

1. Title bar: three colored dots, centered filename
2. Tab bar: three tabs, active tab highlighted with accent border
3. Line numbers: sequential, no gaps, properly aligned
4. Syntax coloring: keywords pink, types purple, strings green, punctuation muted
5. Company links: clickable, open in new tab
6. Scroll behavior: tabs update as you scroll through sections
7. Tab clicks: scroll to correct section
8. Status bar: branch name, TypeScript, line count
9. Minimap: visible on desktop, hidden on mobile
10. Light mode: toggle theme — verify colors still work in light mode
11. Other pages: navigate to `/`, `/projects`, `/blog` — ensure nothing is broken

**Step 2: Fix any issues found**

Address any visual issues discovered during QA.

**Step 3: Final commit if any fixes were made**

```bash
git add src/pages/resume.astro
git commit -m "fix(resume): visual QA fixes"
```
