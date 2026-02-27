# MIL TV Help Guide System — Build Plan
> **For Claude Code:** This document contains the full plan and phase-by-phase prompts for building a TV help guide system on staubracing.com. When starting a session, the user will tell you which phase to work on. Read the full stack reference before starting any phase.

---

## The Goal

Build a QR-code-accessible TV help guide for a 77-year-old non-technical user. She scans a laminated QR code near her TV, gets a dead-simple mobile page with big buttons, taps her problem, follows step-by-step instructions.

---

## Stack Reference (confirmed)

| Layer | Technology |
|---|---|
| Framework | Astro 5 (SSG) |
| Routing | File-based (`src/pages/`) |
| Content | Markdown + Collections (`src/content/`) |
| Schema | Zod validation (`src/content/config.ts`) |
| Styling | Plain CSS custom properties (`src/styles/`) — no Tailwind |
| Layout | `Layout.astro` has site nav/footer baked in — GuideLayout must be fully standalone |

---

## Architecture

```
staubracing.com/guides          ← QR code landing page
staubracing.com/guides/[slug]   ← Individual guide pages

src/
  content/
    guides/                     ← New collection (alongside existing blog/)
      find-netflix.md
      youtube-tv-missing.md
      reset-modem.md
      change-tv-input.md
  pages/
    guides/
      index.astro               ← Landing page (big tap-target buttons)
      [slug].astro              ← Dynamic guide renderer
  layouts/
    GuideLayout.astro           ← Standalone layout, no site nav
```

---

## Current config.ts (before any changes)

```typescript
import { defineCollection, z } from "astro:content";
import categoriesJson from "./categories.json";

export const CATEGORIES = ["racing", "code", "projects", "life"] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_INFO: Record<
  Category,
  {
    emoji: string;
    title: string;
    color: string;
    description: string;
  }
> = categoriesJson.info;

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string().optional(),
    tags: z.array(z.string()).default([]),
    author: z.string().default("StaubRacing"),
    editor: z.string().optional(),
    featured: z.boolean().default(false),
    category: z.enum(CATEGORIES).default("life"),
    series: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
```

---

## Phase 1 — Content Collection Setup

**Status:** Not started

**Claude Code Prompt:**
```
Open `src/content/config.ts`. Add a new collection before the `export const collections` line:

const guides = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number(),
    icon: z.string(),
  }),
});

Then update the collections export from:
  export const collections = { blog };
to:
  export const collections = { blog, guides };

Do not change anything else in this file.

Then:

1. Create `src/content/guides/find-netflix.md`:
   ---
   title: "Where is Netflix (or any app)?"
   description: "How to find your streaming apps on the Fire Stick"
   order: 1
   icon: "📺"
   ---
   Steps coming soon.

2. Create `src/pages/guides/[slug].astro` using getStaticPaths from the guides collection.
   Render the guide title and Content component. Add a plain "← All Guides" back link to /guides.
   No layout yet, raw HTML only.

3. Create `src/pages/guides/index.astro` that fetches all guides, sorts by `order`, and renders
   a plain list of icon + title + description links. No layout yet.

Show me the final state of config.ts after your changes before doing anything else.
```

---

## Phase 2 — Guide Layout

**Status:** Not started  
**Requires:** Phase 1 complete

**Claude Code Prompt:**
```
Create `src/layouts/GuideLayout.astro` for my Astro site (plain CSS, no Tailwind).

This layout must be completely standalone — do NOT import or extend Layout.astro. That file
has the site nav and footer baked in and we want none of it here.

Props: title (string), description (string, optional)

Requirements:
- Mobile-first, optimized for reading on a phone
- Look at src/styles/ and reuse any existing CSS custom properties where they make sense,
  but do not depend on them — this layout must render correctly on its own
- Body font size: 18px minimum
- Headings: 28px+
- High contrast: dark text on white background
- Max width: 680px centered, generous padding on small screens
- Header: page title + "← All Guides" link back to /guides
- Footer: "Need more help? Call Dev." (placeholder)
- Numbered steps in Markdown should be visually large and clear
- Images in Markdown should be full-width with subtle border-radius
- No external fonts, no external dependencies

Then update `src/pages/guides/[slug].astro` to use GuideLayout, passing the guide's
title and description as props.
```

---

## Phase 3 — Landing Page

**Status:** Not started  
**Requires:** Phase 2 complete

**Claude Code Prompt:**
```
Update `src/pages/guides/index.astro` to be a polished, mobile-first landing page.
Use GuideLayout.astro as the layout (pass title="TV Help" and no description).

Requirements:
- Large friendly header: "Need help with the TV?"
- Subtitle: "Tap the button that matches your problem."
- Each guide renders as a large full-width card linking to /guides/[slug], showing:
  - Emoji icon (~40px)
  - Guide title, bold, 20px+
  - Description in smaller muted text
- Cards should be easy to tap on a phone — generous padding, full width, visible tap state
- Sort guides by the `order` frontmatter field
- High contrast, white background
- Plain CSS only, no Tailwind
```

---

## Phase 4 — Guide Content

**Status:** Not started  
**Requires:** Phase 3 complete

**Claude Code Prompt:**
```
Create four Markdown guide files in `src/content/guides/`. Write for a 77-year-old who is
not tech-savvy. Short sentences. One action per step. No jargon.

1. `find-netflix.md`
   title: "Where is Netflix (or any app)?"
   icon: 📺 | order: 1
   Content: How to press the Home button on the Fire Stick remote (describe it as "the button
   with the small house icon"), navigate to the app row on the home screen, and scroll to find
   the app. Include a note about what to do if the app isn't visible.

2. `youtube-tv-missing.md`
   title: "YouTube TV disappeared"
   icon: 📡 | order: 2
   Content: How to use the Search button (magnifying glass) on the Fire Stick remote to search
   for "YouTube TV" and launch it. Include a note that the home screen sometimes rearranges.

3. `reset-modem.md`
   title: "Internet is out — reset the modem"
   icon: 🌐 | order: 3
   Content: Locate the modem (describe as "a small black box with blinking lights, usually near
   the TV or in a closet"), unplug from the wall, wait 30 seconds counting slowly, plug back in,
   wait 2 minutes for lights to settle, check if TV works. If still broken, call Dev.

4. `change-tv-input.md`
   title: "Black screen or wrong picture"
   icon: 🔲 | order: 4
   Content: Use the TV remote (not the Fire Stick remote — the bigger one), find the button
   labeled "Input" or "Source," press it until the screen shows "HDMI" or "Fire TV," wait for
   the picture. If there are multiple HDMI options, try them one at a time.

Add image placeholder comments where a photo would help, like:
<!-- IMAGE: photo of the home button on the Fire Stick remote -->
```

---

## Phase 5 — QR Code

**Status:** Not started  
**Requires:** Site deployed with /guides live

Ask Thufir (the other Claude instance in the web UI):
> "Generate a QR code for https://staubracing.com/guides"

---

## Image Workflow (manual, after code is live)

Take phone screenshots or photos and drop them in `public/images/guides/`. Reference in Markdown:

```markdown
![The Home button on the Fire Stick remote](/images/guides/fire-stick-home-button.jpg)
```

Suggested filenames:
- `fire-stick-home-button.jpg`
- `fire-stick-search-button.jpg`
- `modem-unplug.jpg`
- `tv-remote-input-button.jpg`

---

## Physical Deliverable

1. Deploy site with /guides live
2. Generate QR code (Phase 5)
3. Print on cardstock, minimum 3x3 inches
4. Laminate
5. Tape to the side of the TV or cable box

---

## Backlog

- "Remote has no batteries" guide
- "TV is frozen / stuck" guide
- "No sound" guide
- "Discovery+ is gone" guide
- Add real phone number to footer of every guide
- Text size toggle (bigger/smaller) for accessibility
- Dark mode option
