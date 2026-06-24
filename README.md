# Staub Racing

A personal site built with Astro 5, featuring motorcycle racing content, coding projects, DIY builds, and life updates. Deployed at [staubracing.com](https://staubracing.com).

## Quick Start

```bash
# Install dependencies
yarn install

# Start development server (http://localhost:4321)
yarn dev

# Build for production
yarn build

# Preview production build
yarn preview

# TypeScript validation
yarn astro check
```

## Deployment

Automatic via GitHub Actions on push to `main`:

- Builds with `astro build`
- Syncs `dist/` to AWS S3
- Invalidates CloudFront cache

No manual deploy command needed — just `git push`.

## Project Structure

```
src/
├── pages/           # File-based routes
├── layouts/         # Shared page shell (Layout.astro)
├── components/      # Reusable UI components
├── content/blog/    # Blog posts organized by category
├── data/            # Static data (bikes, links, events)
└── styles/          # Theme and global CSS

public/images/       # Static images (blog, gallery)
scripts/             # Utility scripts (image helpers)
docs/                # Documentation
```

## Creating Content

Use the `/new-post` skill to scaffold a new blog post:

```bash
# In Claude Code
/new-post
```

Or manually create a markdown file in `src/content/blog/{category}/` with required frontmatter:

```yaml
---
title: "Post Title"
date: 2026-02-22
tags: ["tag1", "tag2"]
category: racing
draft: false
---
```

See [docs/guides/creating-posts.md](docs/guides/creating-posts.md) for details.

## Tech Stack

| Layer     | Tool                  |
| --------- | --------------------- |
| Framework | Astro 5               |
| Content   | Markdown/MDX          |
| Styling   | CSS custom properties |
| Hosting   | AWS S3                |
| CDN       | AWS CloudFront        |
| CI/CD     | GitHub Actions        |

## Documentation

| I want to...            | See                                                                      |
| ----------------------- | ------------------------------------------------------------------------ |
| Change colors/theme     | [docs/guides/theme-customization.md](docs/guides/theme-customization.md) |
| Add images to posts     | [docs/guides/adding-images.md](docs/guides/adding-images.md)             |
| Create a new post       | [docs/guides/creating-posts.md](docs/guides/creating-posts.md)           |
| Understand architecture | [docs/reference/architecture.md](docs/reference/architecture.md)         |

Full documentation index: [docs/README.md](docs/README.md)

## Development Notes

For AI assistants working on this codebase, see [CLAUDE.md](CLAUDE.md) for project context, conventions, and coding patterns.
