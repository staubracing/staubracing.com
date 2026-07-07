---
name: new-post
description: Create a new blog post with proper frontmatter, folder structure, and image directory. Use when the user wants to write a new post, start a blog entry, or scaffold content.
---

# New Post Skill

Scaffold a new blog post for the Staub Racing Astro site with correct frontmatter, folder placement, and image directory.

## Usage

```
/new-post <title>
/new-post <title> --category <cat>
/new-post <title> --category <cat> --tags <tag1,tag2>
/new-post <title> --draft
/new-post <title> --series <series-name>
```

## Available Categories

| Category | Emoji | Description |
|----------|-------|-------------|
| `racing` | 🏍️ | Track days, race reports, bike builds |
| `code` | 💻 | Apps, tutorials, dev journey |
| `projects` | 🔧 | Linux, Raspberry Pi, DIY electronics |
| `life` | 📝 | Personal stuff, thoughts, updates |

## Instructions

When this skill is invoked, you MUST:

### 1. Parse Arguments

- **title** (required): The post title in plain English
- **--category / -c** (optional): One of `racing`, `code`, `projects`, `life`. Default: ask user or infer from context
- **--tags / -t** (optional): Comma-separated list of tags
- **--draft / -d** (optional): Create as draft (default: true for new posts)
- **--series / -s** (optional): Series name for multi-part posts
- **--featured / -f** (optional): Mark as featured post

### 2. Generate Slug

Convert the title to a kebab-case slug:
- Lowercase everything
- Replace spaces with hyphens
- Remove special characters
- Keep it readable

Example: "My ZX6R Engine Rebuild Part 2" → `zx6r-engine-rebuild-part-2`

### 3. Determine Category

If not specified:
1. Check if the title contains obvious hints (e.g., "track day" → racing)
2. If still unclear, ask the user to choose

### 4. Create the Post File

**File path:** `src/content/blog/{category}/{slug}.md`

Generate frontmatter using today's date:

```yaml
---
title: "{Original Title}"
date: {TODAY'S DATE YYYY-MM-DD}
description: ""
tags: [{tags array}]
author: "StaubRacing"
editor: "Michael T Smith"
category: "{category}"
draft: true
---
```

**Important:**
- Use `draft: true` by default for new posts
- Leave `description` empty for the user to fill in
- Always include `editor: "Michael T Smith"` by default, regardless of category (revisit if a different editor is ever used)
- Include the series field only if `--series` was provided
- Include `featured: true` only if `--featured` was provided

### 5. Add Starter Content

After frontmatter, include helpful boilerplate:

```markdown
## {Context Heading}

<!-- Write your introduction here -->

## {Main Content Heading}

<!-- Your content goes here -->

## What's Next

<!-- Optional: tease future content or wrap up -->
```

Use context-appropriate headings based on category:
- **racing**: "What Happened", "The Build", "Track Notes"
- **code**: "The Problem", "The Solution", "Key Takeaways"
- **projects**: "The Goal", "How I Did It", "Results"
- **life**: "Background", "Thoughts", "Moving Forward"

### 6. Create Image Directory

Create the image folder at:
```
public/images/blog/{category}/{slug}/
```

Add a `.gitkeep` file to ensure the empty directory is tracked:
```bash
touch public/images/blog/{category}/{slug}/.gitkeep
```

### 7. Confirm and Guide

After creating, tell the user:

```
Created new post:
📄 src/content/blog/{category}/{slug}.md
📁 public/images/blog/{category}/{slug}/

Next steps:
1. Write your content in the .md file
2. Add images to the image folder
3. Run `node scripts/add-images.js generate-html {category}/{slug}` for image snippets
4. Set `draft: false` when ready to publish
5. Run `yarn build && yarn preview` to test
```

## Example Invocation

**User says:** `/new-post "Upgrading my brake pads" --category racing --tags "brakes,safety,maintenance"`

**You create:**

File: `src/content/blog/racing/upgrading-my-brake-pads.md`

```yaml
---
title: "Upgrading My Brake Pads"
date: 2026-02-16
description: ""
tags: ["brakes", "safety", "maintenance"]
author: "StaubRacing"
editor: "Michael T Smith"
category: "racing"
draft: true
---

## What Happened

<!-- Write your introduction here -->

## The Upgrade

<!-- Your content goes here -->

## Results

<!-- How did it go? -->
```

And create folder: `public/images/blog/racing/upgrading-my-brake-pads/`

## Important Notes

- Always use today's date (format: YYYY-MM-DD)
- Slug should be unique - check if file exists first, append `-2` if needed
- Keep `draft: true` until the user is ready to publish
- The image folder path mirrors the content path pattern
- If the user mentions "part 2" or similar, suggest using the `--series` flag
