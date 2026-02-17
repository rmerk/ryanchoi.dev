---
name: new-post
description: Scaffold a new blog post with correct frontmatter
disable-model-invocation: true
---

# New Blog Post

Create a new blog post file in `src/content/blog/`.

## Arguments

The user provides a title. If not provided, ask for one.

## Steps

1. Take the title and generate a URL-friendly slug (lowercase, hyphens, no special chars).
2. Create `src/content/blog/<slug>.md` with this frontmatter:

```yaml
---
title: <Title>
date: <today's date as YYYY-MM-DD>
tags: []
draft: true
description:
---
```

3. Leave the body empty after the frontmatter closing `---`.
4. Tell the user the file was created and remind them to:
   - Add tags (array of strings)
   - Write a description (optional but recommended)
   - Set `draft: false` when ready to publish

## Schema Reference

From `src/content.config.ts`, the blog schema is:
- `title`: string (required)
- `date`: date (required, coerced)
- `tags`: string[] (defaults to `[]`)
- `draft`: boolean (defaults to `false`)
- `description`: string (optional)

## Important

- Always set `draft: true` for new posts so they don't accidentally publish.
- Use today's date (YYYY-MM-DD format).
- The slug should match the filename exactly.
