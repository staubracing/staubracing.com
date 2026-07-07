# Code projects page slim-down

## Goal

Apply the same live/WIP cleanup logic already used in the personal wiki's
`Projects/projects.html` registry to the site's `/code` page, so visitors
see a short, accurate list instead of a stale, over-categorized one.

## Context

`src/data/code-projects.json` currently lists 12 projects with a three-value
`status` (`active` / `planned` / `done`), grouped into 5 categories on
`code.astro`. Several entries are AI/ML experiments the wiki has already
archived as dead ends (never used, or superseded by the wiki itself), and a
couple of statuses have drifted from the wiki's more current picture (e.g.
Moto App Pro is WIP per the wiki, but listed `active` on the site).

## Data changes (`code-projects.json`)

- `status` becomes a two-value enum: `"live"` or `"wip"`.
- Remove 4 entries entirely (dead per the wiki's cleanup):
  - Project Doc Assistant
  - AI Assistant
  - Documentation RAG
  - Private AI
- Remap remaining statuses:
  - Updog Coffee: `done` → `live`
  - Moto App Pro: `active` → `wip` (matches wiki: Phase 3, in progress)
  - Kiera Site: `planned` → `wip`
  - Meal Planner: `planned` → `wip`
  - Staub Racing Site, Chris Staub Site, Moto-API, MoneyMap: stay `live`
- `category` field is kept per project (not removed), but stops being the
  grouping axis — see page changes below.

Final list (8 total):

| Live | WIP |
|---|---|
| Staub Racing Site | Moto App Pro |
| Chris Staub Site | Kiera Site |
| Moto-API | Meal Planner |
| MoneyMap | |
| Updog Coffee | |

## Page changes (`code.astro`)

- Replace the 5-category grouping (`Mobile Apps`, `Websites`, `Backend`,
  `Client Work`, `AI/ML`) with two sections in fixed order: **Live**, then
  **WIP**.
- Drop the per-card status badge (🔄/📋/✓) — redundant now that the section
  heading conveys live/WIP status.
- Fold `category` into the existing tags row on each card (alongside `tech`
  tags) so that context isn't lost, styled with the existing `.tech-tag`
  class rather than introducing a new one.
- Section styling reuses existing tokens: Live section accent uses
  `--accent-lime`, WIP section accent uses `--accent-amber` (same colors
  already used for the `active`/`planned` badges being removed).

## Out of scope

- No changes to the wiki (`Documentation/Projects/projects.html` or
  `projects.json`).
- No changes to other pages referencing "project" (`resume.astro`,
  `workshop.astro`, `journal.astro`).
- No new data fields beyond the `status` enum change.
