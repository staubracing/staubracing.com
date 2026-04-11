# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Staub Racing is a consolidated personal site built with Astro 5, featuring motorcycle racing content, coding projects, DIY builds, and life updates. The site uses static generation with MDX support and deploys to AWS S3 + CloudFront at `staubracing.com`.

**Status:** Unified Astro codebase deployed to AWS (migration from two-site setup complete).

## Quick Start

```bash
yarn install              # Install dependencies
yarn dev                  # Start development server (http://localhost:4321)
```

## Commands

```bash
yarn dev          # Start development server (http://localhost:4321)
yarn build        # Build for production (outputs to dist/)
yarn preview      # Preview production build locally
yarn astro check  # TypeScript validation
```

### Deployment

Deployed automatically via GitHub Actions on push to `main`:

- Builds with `astro build`
- Syncs `dist/` to AWS S3
- Invalidates CloudFront cache

No manual deploy command needed — just `git push`.

**Required GitHub Secrets:**

- `GOOGLE_CALENDAR_API_KEY` - For calendar integration
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` - S3/CloudFront access
- `CLOUDFRONT_DISTRIBUTION_ID` - Cache invalidation

**Local development requires Node.js 20+**

**Production gotcha:** S3/CloudFront serves URLs with trailing slashes (`/about/`) while local dev does not (`/about`). Always normalize paths when comparing `Astro.url.pathname`:

```javascript
const currentPath = Astro.url.pathname.replace(/\/$/, "") || "/";
```

### Media Helper Scripts

```bash
node scripts/add-images.js create-folders           # Scaffold category directories
node scripts/add-images.js generate-html <post>      # Print Markdown snippets for images
```

**Image organization:** Blog images follow the pattern `public/images/blog/{category}/{post-slug}/`. Use the helper script above to scaffold folders and generate HTML snippets.

Before committing changes, run `yarn build` and `yarn preview` to verify.

## File Conventions

- **Pages**: kebab-case (`about.astro`, `blog/[...slug].astro`)
- **Components**: PascalCase (`MediaDisplay.astro`, `ThemeToggle.astro`)
- **Blog posts**: kebab-case slugs, organized by category in `src/content/blog/{category}/`
- **Indentation**: 2 spaces

### Directory Structure

```
staubracing.com/
├── public/
│   └── images/
│       ├── blog/          # Blog images by {category}/{slug}/
│       └── gallery/       # Racing gallery and site assets
├── scripts/
│   └── add-images.js      # Media helper for blog post images
├── src/
│   ├── components/
│   │   ├── ui/            # Reusable cards and UI elements
│   │   │   ├── BikeCard.astro
│   │   │   └── MaintenanceList.astro
│   │   ├── SocialIcons.astro  # Social links with compact/cards variants
│   │   ├── SubNav.astro
│   │   ├── ThemeToggle.astro
│   │   └── MediaDisplay.astro
│   ├── content/
│   │   ├── blog/          # Blog posts organized by category
│   │   ├── categories.json
│   │   └── config.ts      # Content collection schema
│   ├── data/              # Static data files (bike specs, links, etc.)
│   ├── services/
│   │   └── auth.ts        # AWS Cognito authentication helpers
│   ├── layouts/
│   │   ├── Layout.astro   # Shared page shell (includes nav + footer inline)
│   │   └── GuideLayout.astro  # Layout for guide pages
│   ├── pages/
│   │   ├── index.astro       # Home
│   │   ├── racing.astro      # Racing section
│   │   ├── workshop.astro    # Workshop section (DIY builds)
│   │   ├── code.astro        # Code section
│   │   ├── journal.astro     # Journal section
│   │   ├── calendar.astro    # Event calendar
│   │   ├── maintenance.astro # Public maintenance view
│   │   ├── guides/index.astro     # Guides listing
│   │   ├── guides/[slug].astro    # Individual guide pages
│   │   ├── admin/login.astro       # API key auth
│   │   ├── admin/maintenance.astro # Quick-capture form
│   │   ├── contact.astro     # Contact page
│   │   ├── links.astro       # Links hub
│   │   ├── blog/[...slug].astro
│   │   └── category/[category].astro
│   └── styles/
│       ├── theme.css      # CSS custom properties for theming
│       └── global.css     # Global styles
└── astro.config.mjs       # Site config (URL: https://staubracing.com)
```

## Content Collections

Blog posts use Astro's content collection system with schema validation in `src/content/config.ts`. Required frontmatter fields:

- `title` - Post title
- `date` - Publication date
- `tags` - Array of tags
- `category` - One of: racing, code, projects, life
- `draft` - Boolean (true for WIP posts, excluded from builds)
- `series` - Optional string for multi-part posts (e.g., "ZX6R Rebuild")
- `editor` - Optional editor credit
- `featured` - Boolean for highlighting posts (default: false)

**Draft posts:** Setting `draft: true` excludes the post from production builds. Draft posts are still visible during development (`yarn dev`).

Categories are configured in `src/content/categories.json` with associated emojis and colors.

## Architecture

### Site Structure

Main navigation: Home, Racing, Workshop, Code, Journal, Contact

Each section page (racing, workshop, code, journal) aggregates blog posts from its category and may include section-specific content.

### Routing

- File-based routing in `src/pages/`
- Static pages: `index.astro`, `racing.astro`, `workshop.astro`, `code.astro`, `journal.astro`, `contact.astro`, `links.astro`, `calendar.astro`, `maintenance.astro`, `guides/index.astro`
- Guide pages: `guides/index.astro` (listing), `guides/[slug].astro` (individual guides)
- Admin pages: `admin/login.astro`, `admin/maintenance.astro` (API key auth required)
- Admin auth uses AWS Cognito via `src/services/auth.ts`. Sessions are managed client-side with Amplify.
- Dynamic: `blog/[...slug].astro` for posts, `category/[category].astro` for category listings

### Calendar Integration

The race calendar (`/calendar`) displays Staub Racing's season schedule with a clean event list + toggle to full Google Calendar view.

**Current Status:** Mock data in `src/data/mock-events.ts`. Ready for Google Calendar API integration.

**Calendar Details:**

- **Calendar ID:** Set in `GOOGLE_CALENDAR_ID` environment variable (see `.env.example`)
- **Event type classification (for API):**
  - `CRA` in title → Race Weekend (🏁 lime badge)
  - `ZARS` in title → Track Day (🔧 blue badge)
  - Other → Track Day (default)

**API Integration TODO:**

1. Create Google Cloud project → Enable Calendar API
2. Generate API key (restrict to Calendar API only)
3. Add `GOOGLE_CALENDAR_API_KEY` to `.env`
4. Replace mock data fetch in `calendar.astro` frontmatter

### Styling

- CSS custom properties in `src/styles/theme.css` for theming
- Dark mode by default, light mode via `ThemeToggle` component
- Racing theme with green accents (#1a8754)
- Glassmorphism effects with backdrop filters
- Mobile-first responsive design

### Page Headers

Section pages use clean, minimal headers with just `h1` and `p` — no redundant category pills. The navigation and theming already provide context.

**Pattern:**

```astro
<header class="section-header">
  <h1>{title}</h1>
  <p>{description}</p>
</header>
```

**Where `.category-pill` IS still used:**

- Homepage featured post cards (each card needs its category label)
- `category/[category].astro` (dynamic category pages)
- `index.astro` post cards

**Where `.category-pill` is NOT used:**

- Main section pages (`racing.astro`, `workshop.astro`, `code.astro`, `journal.astro`)
- Racing-related pages (`calendar.astro`, `maintenance.astro`)
- Utility pages (`contact.astro`, `links.astro`)
- Guide pages (`guides/index.astro`, `guides/[slug].astro`)
- Admin pages (`admin/login.astro`, `admin/maintenance.astro`)

### Navigation Active States

The main navigation highlights the current page/section with a racing green filled pill. Path matching handles trailing slashes for production compatibility:

```javascript
// Normalize path (production uses trailing slashes, local dev does not)
const currentPath = Astro.url.pathname.replace(/\/$/, '') || '/';

// Exact match for single pages
<a href="/about" class={currentPath === '/about' ? 'active' : ''}>About</a>

// Prefix match for sections with nested routes
<a href="/racing" class={currentPath.startsWith('/racing') ? 'active' : ''}>Racing</a>
```

### Brand Accent Consistency

The racing green (`--accent-racing`) is used consistently for the "Staub" brand across:

- Header logo: `.brand-primary` class
- Footer brand: `.brand-accent` within `.footer-brand`
- Homepage hero: `.brand-accent` class
- Active nav pill: `.site-nav a.active`

### Layouts

- `src/layouts/Layout.astro` — Shared page shell with embedded navigation and footer (no separate Nav/Footer components)

### Key Components

- `ThemeToggle.astro` — Dark/light mode switching with localStorage persistence
- `MediaDisplay.astro` — Renders images, videos, and embedded content for blog posts
- `SubNav.astro` — Section-specific navigation with category links
- `SocialIcons.astro` — Social media links with two variants: `compact` (small icons) and `cards` (contact page style). Uses platform-specific accent colors with glow effects.
- `ui/BikeCard.astro` — Bike specs display with status indicators
- `ui/MaintenanceList.astro` — Renders maintenance tasks from Lambda API

**Note:** Blog posts and links are rendered inline in page templates rather than using card components. Navigation is embedded directly in Layout.astro.

### Component Patterns

**Variant Props** — Components like `SocialIcons.astro` support multiple rendering modes via a `variant` prop:

```astro
<SocialIcons variant="cards" />   <!-- Contact page: full cards with icons -->
<SocialIcons variant="compact" /> <!-- Footer: small icon buttons -->
```

This pattern keeps shared data (links, icons) in one place while allowing different visual presentations.

## Commit Style

Use imperative sentence case: "Revise homepage content..." or "Add new blog post about..."

## Tech Stack

| Layer           | Tool                          |
| --------------- | ----------------------------- |
| Framework       | Astro 5                       |
| Content         | Markdown/MDX with frontmatter |
| Styling         | CSS with custom properties    |
| Auth            | AWS Cognito (via Amplify)     |
| Hosting         | AWS S3 (static files)         |
| CDN             | AWS CloudFront                |
| DNS             | AWS Route 53                  |
| SSL             | AWS Certificate Manager       |
| CI/CD           | GitHub Actions                |
| Package Manager | Yarn                          |

## Backend API

The backend is a standalone Express server (not Lambda) running on a Raspberry Pi called "arrakis" (staubracing@raspberrypi).

**Repo:** github.com/staubracing/moto-lambda-API (branch: main)
**Live URL:** https://api.staubracing.com (via Cloudflare Tunnel)
**Local:** http://127.0.0.1:3001

**Deploy workflow:**

1. Edit code on dev laptop
2. Push to GitHub
3. SSH into arrakis
4. git pull && yarn build && pm2 restart moto-api

**Stack:**

- Express + TypeScript
- pm2 for process management (survives reboots via systemd)
- PostgreSQL in Docker container (postgres-db)
- Cloudflare Tunnel for public access (no exposed home IP)

**Database:**

- Container: postgres-db
- Connect: `docker exec -it postgres-db psql -U <db_user> -d <db_name>` (see local credentials)
- Key tables: users, motorcycles, maintenance_records, tire_info, suspension, bike_settings

**Auth:**

- Dual auth: Cognito JWT (Bearer token) OR x-api-key header
- cognitoAuth middleware validates all routes
- req.user.sub = Cognito UUID, maps to users.cognito_user_id
- Always look up local user via User.findByCognitoUserId(sub) before using user.fields.id

**API Endpoints:**

- GET /maintenance - returns records for authenticated user only
- POST /maintenance - creates record with user_id from JWT
- PATCH /maintenance/:id - updates record, verifies ownership
- DELETE /maintenance/:id - deletes record, verifies ownership
- GET /bikes/me - returns bikes owned by authenticated user

## Claude Code Extensions

Custom skills and agents for this project:

**Skills** (invoked with `/skill-name`):

- `new-post` — Scaffold a new blog post with proper frontmatter and image folder
- `add-maintenance` — Add a maintenance task to the tracker

**Agents**:

- `content-reviewer` — Validates blog posts for quality and consistency

## Documentation

Documentation is organized by purpose using the [Diátaxis framework](https://diataxis.fr/).

### Quick Reference

| I want to...                | See                                                                     |
| --------------------------- | ----------------------------------------------------------------------- |
| Change colors/theme         | [guides/theme-customization.md](docs/guides/theme-customization.md)     |
| Add images to posts         | [guides/adding-images.md](docs/guides/adding-images.md)                 |
| Create a new post           | [guides/creating-posts.md](docs/guides/creating-posts.md)               |
| Understand architecture     | [reference/architecture.md](docs/reference/architecture.md)             |
| Look up frontmatter fields  | [reference/content-schema.md](docs/reference/content-schema.md)         |
| Use the Maintenance API     | [reference/maintenance-api.md](docs/reference/maintenance-api.md)       |
| Understand design decisions | [explanation/design-decisions.md](docs/explanation/design-decisions.md) |
| Plan content                | [planning/blog-ideas.md](docs/planning/blog-ideas.md)                   |

### Documentation Index

See [docs/README.md](docs/README.md) for the full documentation index and navigation.
