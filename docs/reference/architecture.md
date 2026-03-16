# Architecture Reference

System overview, routing, and component structure for staubracing.com.

## Tech Stack

| Layer | Tool |
|-------|------|
| Framework | Astro 5 |
| Content | Markdown/MDX with frontmatter |
| Styling | CSS with custom properties |
| Hosting | AWS S3 (static files) |
| CDN | AWS CloudFront |
| DNS | AWS Route 53 |
| SSL | AWS Certificate Manager |
| CI/CD | GitHub Actions |
| Package Manager | Yarn |

## Site Structure

### Navigation

Main navigation: Home, Racing, Workshop, Code, Journal, Contact

### URL Structure

| Path | Page | Description |
|------|------|-------------|
| `/` | Home | Hero + recent posts + stats |
| `/racing` | Racing section | Bike cards + racing posts |
| `/racing/reports` | Race reports | Filtered post list |
| `/workshop` | Workshop section | DIY builds + project posts |
| `/code` | Code section | Dev posts + tutorials |
| `/code/posts` | Code posts | Filtered post list |
| `/journal` | Journal section | Life posts |
| `/calendar` | Event calendar | Race schedule |
| `/maintenance` | Public maintenance | Task list |
| `/admin/login` | Admin login | API key auth |
| `/admin/maintenance` | Admin form | Quick-capture |
| `/contact` | Contact | Social links |
| `/links` | Links hub | Curated links |
| `/blog/[slug]` | Blog post | Dynamic post pages |
| `/category/[category]` | Category page | Filtered listings |

## Routing

File-based routing in `src/pages/`:

### Static Pages
- `index.astro`, `racing.astro`, `workshop.astro`, `code.astro`, `journal.astro`
- `contact.astro`, `links.astro`, `calendar.astro`, `maintenance.astro`
- `admin/login.astro`, `admin/maintenance.astro`

### Dynamic Pages
- `blog/[...slug].astro` — Blog post renderer
- `category/[category].astro` — Category listings

### Production Gotcha

S3/CloudFront serves URLs with trailing slashes (`/about/`) while local dev does not (`/about`). Always normalize:

```javascript
const currentPath = Astro.url.pathname.replace(/\/$/, '') || '/';
```

## Directory Structure

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
│   │   ├── SocialIcons.astro
│   │   ├── SubNav.astro
│   │   ├── ThemeToggle.astro
│   │   └── MediaDisplay.astro
│   ├── content/
│   │   ├── blog/          # Blog posts organized by category
│   │   ├── categories.json
│   │   └── config.ts      # Content collection schema
│   ├── data/              # Static data files
│   ├── layouts/
│   │   └── Layout.astro   # Shared page shell
│   ├── pages/             # File-based routes
│   └── styles/
│       ├── theme.css      # CSS custom properties
│       └── global.css     # Global styles
└── astro.config.mjs
```

## Components

### Layout Components

| Component | Purpose |
|-----------|---------|
| `Layout.astro` | Page shell with nav + footer inline |
| `ThemeToggle.astro` | Dark/light mode with localStorage |

### UI Components

| Component | Purpose |
|-----------|---------|
| `MediaDisplay.astro` | Images, videos, embeds for posts |
| `SubNav.astro` | Section-specific navigation |
| `SocialIcons.astro` | Social links (compact/cards variants) |
| `ui/BikeCard.astro` | Bike specs with status indicators |
| `ui/MaintenanceList.astro` | Task list from Lambda API |

### Component Pattern: Variant Props

Components support multiple rendering modes via `variant` prop:

```astro
<SocialIcons variant="cards" />   <!-- Full cards with icons -->
<SocialIcons variant="compact" /> <!-- Small icon buttons -->
```

## Styling Architecture

### CSS Files

| File | Purpose |
|------|---------|
| `theme.css` | Color variables, spacing, typography tokens |
| `global.css` | Base styles, utility classes, component styles |

### Theme Variables

```css
/* Colors */
--accent-racing: #1a8754;
--accent-lime: #66BB6A;
--accent-electric: #38bdf8;

/* Typography */
--font-size-h1, --font-size-h2, --font-size-h3, --font-size-h4
--letter-spacing-heading

/* Spacing */
--radius-lg: 28px;
--radius-md: 18px;
--layout-max: 1200px;
```

## Deployment Pipeline

```
git push main → GitHub Actions → astro build → S3 sync → CloudFront invalidation
```

No manual deploy needed — push to `main` triggers automatic deployment.

### S3 Bucket Sharing with Updog Coffee

> ⚠️ **TEMPORARY**: This will be removed when Updog Coffee gets its own S3 bucket.

The S3 bucket `s3://staubracing.com` is shared with the Updog Coffee site at `/updog/`. The deploy workflow uses `--exclude "updog/*"` to prevent deleting the Updog files during deployment.

**Files affected:**
- `.github/workflows/deploy.yml` — S3 sync command has exclude flag

**When to remove:**
Once Updog Coffee has its own S3 bucket and CloudFront distribution, remove the `--exclude "updog/*"` flag from the deploy workflow.

**Related:** `~/Projects/Clients/UpdogCoffee/html-site/`

## External Integrations

### Google Calendar (Planned)

- Calendar ID stored in `calendar.astro`
- Events classified by title pattern (`CRA` → Race, `ZARS` → Track Day)
- Currently using mock data in `src/data/mock-events.ts`

### Maintenance API

- Lambda API on localhost:3000 (local dev)
- PostgreSQL on Docker (Raspberry Pi)
- See [Maintenance API Reference](maintenance-api.md)
