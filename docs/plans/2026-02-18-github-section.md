# GitHub Section — Separate & Expand

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extract the GitHub sidebar from the Featured Work section into its own full-width section with pinned repos and a languages breakdown.

**Architecture:** Replace the current `GitHubSidebar.astro` sidebar component with a new `GitHubSection.astro` full-width section component. Move GitHub API fetching into the new component, adding a repos endpoint for pinned/popular repos and language data. The projects grid gets its own full-width layout. Section order: Hero → Featured Work → GitHub → Latest Writing.

**Tech Stack:** Astro 5 components, GitHub REST API (unauthenticated, build-time), Tailwind CSS v4

---

### Task 1: Create `GitHubSection.astro` — data fetching

**Files:**
- Create: `src/components/GitHubSection.astro`

**Step 1: Create the component with expanded GitHub API fetching**

The new component fetches 3 endpoints in parallel: user profile, recent events, and top repos (sorted by stars). All unauthenticated, all at build time.

```astro
---
// src/components/GitHubSection.astro

interface GitHubProfile {
  avatar_url: string;
  public_repos: number;
  followers: number;
  html_url: string;
  bio: string | null;
}

interface GitHubEvent {
  type: string;
  repo: { name: string };
  created_at: string;
}

interface GitHubRepo {
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
}

let profile: GitHubProfile = {
  avatar_url: 'https://github.com/rmerk.png',
  public_repos: 30,
  followers: 15,
  html_url: 'https://github.com/rmerk',
  bio: null,
};

let recentActivity: { repo: string; type: string; timeAgo: string }[] = [];
let topRepos: GitHubRepo[] = [];

try {
  const headers = { 'User-Agent': 'ryanchoi-dev' };
  const [profileRes, eventsRes, reposRes] = await Promise.all([
    fetch('https://api.github.com/users/rmerk', { headers }),
    fetch('https://api.github.com/users/rmerk/events?per_page=5', { headers }),
    fetch('https://api.github.com/users/rmerk/repos?sort=stars&per_page=6&direction=desc', { headers }),
  ]);

  if (profileRes.ok) {
    const data = await profileRes.json();
    profile = {
      avatar_url: data.avatar_url,
      public_repos: data.public_repos,
      followers: data.followers,
      html_url: data.html_url,
      bio: data.bio,
    };
  }

  if (eventsRes.ok) {
    const events: GitHubEvent[] = await eventsRes.json();
    const now = Date.now();
    recentActivity = events.slice(0, 5).map((event) => {
      const diff = now - new Date(event.created_at).getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);
      const timeAgo = days > 0 ? `${days}d ago` : hours > 0 ? `${hours}h ago` : 'just now';
      const typeMap: Record<string, string> = {
        PushEvent: 'Pushed to',
        CreateEvent: 'Created',
        PullRequestEvent: 'PR on',
        IssuesEvent: 'Issue on',
        WatchEvent: 'Starred',
        ForkEvent: 'Forked',
      };
      return {
        repo: event.repo.name.split('/').pop() || event.repo.name,
        type: typeMap[event.type] || event.type.replace('Event', ''),
        timeAgo,
      };
    });
  }

  if (reposRes.ok) {
    topRepos = (await reposRes.json()) as GitHubRepo[];
  }
} catch {
  // Use hardcoded fallbacks
}

// Aggregate languages from top repos
const langCounts: Record<string, number> = {};
for (const repo of topRepos) {
  if (repo.language) {
    langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
  }
}
const languages = Object.entries(langCounts)
  .sort((a, b) => b[1] - a[1])
  .map(([name]) => name);

const langColors: Record<string, string> = {
  TypeScript: 'bg-blue-400',
  JavaScript: 'bg-yellow-400',
  Vue: 'bg-emerald-400',
  Python: 'bg-blue-500',
  HTML: 'bg-orange-400',
  CSS: 'bg-purple-400',
  Shell: 'bg-green-400',
  Rust: 'bg-orange-600',
  Go: 'bg-cyan-400',
};

const eventDotColors: Record<string, string> = {
  'Pushed to': 'bg-green-400',
  'Created': 'bg-blue-400',
  'PR on': 'bg-purple-400',
  'Issue on': 'bg-yellow-400',
  'Starred': 'bg-amber-400',
  'Forked': 'bg-cyan-400',
};
---
```

**Step 2: Add the template markup**

Below the frontmatter `---`, add:

```astro
<section class="py-16">
  <!-- Section header — same pattern as other sections -->
  <div class="flex items-baseline justify-between mb-2">
    <div class="flex items-center gap-2">
      <span class="relative flex h-2 w-2">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
        <span class="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
      </span>
      <h2 class="font-mono text-sm text-muted uppercase tracking-widest">GitHub</h2>
    </div>
    <a href={profile.html_url} target="_blank" rel="noopener noreferrer" class="text-sm text-accent hover:underline font-mono">
      View profile &rarr;
    </a>
  </div>
  <p class="font-mono text-xs text-muted/50 mb-8">// open_source</p>

  <!-- Profile header row -->
  <div class="flex items-center gap-4 mb-8">
    <div class="rounded-full p-0.5 shrink-0" style="background: linear-gradient(135deg, var(--color-accent), var(--color-accent-secondary));">
      <img
        src={profile.avatar_url}
        alt="Ryan Choi"
        width="56"
        height="56"
        class="rounded-full bg-surface"
        loading="lazy"
      />
    </div>
    <div>
      <p class="font-mono text-base text-text font-medium">rmerk</p>
      {profile.bio && <p class="text-sm text-muted mt-0.5">{profile.bio}</p>}
    </div>
    <!-- Stats inline -->
    <div class="hidden sm:flex items-center gap-4 ml-auto">
      <div class="border border-border rounded-md px-4 py-2 text-center">
        <p class="font-mono text-lg text-text font-medium">{profile.public_repos}</p>
        <p class="text-xs text-muted">Repos</p>
      </div>
      <div class="border border-border rounded-md px-4 py-2 text-center">
        <p class="font-mono text-lg text-text font-medium">{profile.followers}</p>
        <p class="text-xs text-muted">Followers</p>
      </div>
    </div>
  </div>

  <!-- Main content: repos grid + activity sidebar -->
  <div class="grid gap-6 lg:grid-cols-[1fr_280px]">

    <!-- Popular repos -->
    <div>
      <h3 class="font-mono text-xs text-muted uppercase tracking-widest mb-4">Popular Repositories</h3>
      <div class="grid gap-3 sm:grid-cols-2">
        {topRepos.slice(0, 6).map((repo) => (
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            class="group border border-border bg-surface rounded-lg p-4 hover:border-accent/50 transition-colors"
          >
            <div class="flex items-start justify-between mb-2">
              <p class="font-mono text-sm text-text font-medium group-hover:text-accent transition-colors truncate">{repo.name}</p>
              {repo.language && (
                <span class="flex items-center gap-1.5 text-[10px] text-muted font-mono shrink-0 ml-2">
                  <span class={`w-2 h-2 rounded-full ${langColors[repo.language] || 'bg-muted'}`} aria-hidden="true"></span>
                  {repo.language}
                </span>
              )}
            </div>
            {repo.description && (
              <p class="text-xs text-muted leading-relaxed line-clamp-2 mb-3">{repo.description}</p>
            )}
            <div class="flex items-center gap-3 text-[11px] text-muted font-mono">
              <span class="flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25z"/></svg>
                {repo.stargazers_count}
              </span>
              <span class="flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0zM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5zM8 12.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5z"/></svg>
                {repo.forks_count}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>

    <!-- Right column: languages + activity -->
    <div class="space-y-6">
      <!-- Languages -->
      {languages.length > 0 && (
        <div class="border border-border bg-surface rounded-lg p-4">
          <h3 class="font-mono text-xs text-muted uppercase tracking-widest mb-3">Languages</h3>
          <div class="flex flex-wrap gap-2">
            {languages.map((lang) => (
              <span class="flex items-center gap-1.5 text-xs text-text font-mono border border-border rounded-md px-2.5 py-1">
                <span class={`w-2 h-2 rounded-full ${langColors[lang] || 'bg-muted'}`} aria-hidden="true"></span>
                {lang}
              </span>
            ))}
          </div>
        </div>
      )}

      <!-- Recent activity -->
      {recentActivity.length > 0 && (
        <div class="border border-border bg-surface rounded-lg p-4">
          <h3 class="font-mono text-xs text-muted uppercase tracking-widest mb-3">Recent Activity</h3>
          <div class="space-y-2.5">
            {recentActivity.map(({ repo, type, timeAgo }) => (
              <div class="flex items-start gap-2 text-xs">
                <span class={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${eventDotColors[type] || 'bg-muted'}`} aria-hidden="true"></span>
                <div class="flex-1 min-w-0">
                  <span class="text-muted">{type}</span>{' '}
                  <span class="text-text font-medium truncate">{repo}</span>
                  <span class="text-muted/60 ml-1">{timeAgo}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>

  </div>
</section>
```

**Step 3: Verify the file was created correctly**

Run: `pnpm astro check`
Expected: No errors in `GitHubSection.astro`

**Step 4: Commit**

```bash
git add src/components/GitHubSection.astro
git commit -m "feat: add expanded GitHubSection component with repos and languages"
```

---

### Task 2: Update `index.astro` — wire up new section, remove sidebar

**Files:**
- Modify: `src/pages/index.astro`

**Step 1: Replace `GitHubSidebar` import with `GitHubSection`**

In the frontmatter, change:
```typescript
import GitHubSidebar from '@/components/GitHubSidebar.astro';
```
to:
```typescript
import GitHubSection from '@/components/GitHubSection.astro';
```

**Step 2: Simplify the Featured Work grid to full-width (remove sidebar column)**

Replace the current grid layout:
```astro
        <div class="grid gap-6 lg:grid-cols-[1fr_320px]">
          <!-- Project cards -->
          <div class="grid gap-4 sm:grid-cols-2">
            {featuredProjects.map((project) => (
              <ProjectCard
                title={project.data.title}
                description={project.data.description}
                tech={project.data.tech}
                url={project.data.url}
                github={project.data.github}
                cover={project.data.cover}
              />
            ))}
          </div>

          <!-- GitHub sidebar -->
          <div class="hidden lg:block">
            <GitHubSidebar />
          </div>
        </div>
```

With a simpler full-width grid:
```astro
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProjects.map((project) => (
            <ProjectCard
              title={project.data.title}
              description={project.data.description}
              tech={project.data.tech}
              url={project.data.url}
              github={project.data.github}
              cover={project.data.cover}
            />
          ))}
        </div>
```

**Step 3: Add the GitHub section between Featured Work and Latest Writing**

After the closing `</section>` of Featured Work and before `<!-- Latest Writing -->`, add:

```astro
    <GitHubSection />
```

**Step 4: Verify**

Run: `pnpm astro check`
Expected: No errors

Run: `pnpm dev`
Expected: Homepage shows three sections in order — Featured Work (full-width project cards), GitHub (profile + repos + activity), Latest Writing

**Step 5: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: separate GitHub into its own section, full-width project grid"
```

---

### Task 3: Delete old `GitHubSidebar.astro`

**Files:**
- Delete: `src/components/GitHubSidebar.astro`

**Step 1: Verify no other files import GitHubSidebar**

Run: `grep -r "GitHubSidebar" src/`
Expected: No results (only the old import in index.astro which was already changed)

**Step 2: Delete the file**

```bash
rm src/components/GitHubSidebar.astro
```

**Step 3: Verify build**

Run: `pnpm astro check`
Expected: No errors

**Step 4: Commit**

```bash
git add -u src/components/GitHubSidebar.astro
git commit -m "chore: remove unused GitHubSidebar component"
```

---

### Task 4: Visual QA and responsive check

**Step 1: Run dev server and check all breakpoints**

Run: `pnpm dev`

Check at these widths:
- **Mobile (375px)**: Stats should be hidden, repos stack single-column, activity shows below repos
- **Tablet (768px)**: Stats visible, repos in 2-col grid, activity sidebar still below on medium screens
- **Desktop (1024px+)**: Full layout — profile header with inline stats, repos 2-col grid + right sidebar with languages and activity

**Step 2: Verify the section ordering**

Page should show: Hero → Featured Work (3 cards, full-width) → GitHub (profile + repos + languages + activity) → Latest Writing

**Step 3: Commit any adjustments**

If spacing/layout tweaks are needed, fix and commit:
```bash
git add -u
git commit -m "fix: adjust GitHub section spacing and responsive layout"
```
