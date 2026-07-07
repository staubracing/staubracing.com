# Code Projects Slim-Down Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Slim `/code` down to a Live/WIP list matching the wiki's cleanup logic, removing 4 dead AI/ML entries and dropping the 5-category grouping.

**Architecture:** Two-file change. `code-projects.json` gets a two-value `status` enum (`live`/`wip`) and drops 4 entries. `code.astro` groups by that status instead of by `category`, and stops rendering the per-card status badge.

**Tech Stack:** Astro 5, static JSON data file, no test framework for content pages in this repo.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-07-code-projects-slimdown-design.md`
- `status` is exactly two values: `"live"` | `"wip"` — no other values permitted.
- Section order is fixed: Live first, then WIP.
- `category` field stays in the data (not deleted) but is rendered as a tag, not a grouping key.
- No new npm dependencies. No changes to other pages.
- Verification method for this repo: `yarn astro check` (typecheck) and `yarn build` (production build must succeed) — there is no unit test suite for `.astro` pages.

---

### Task 1: Update `code-projects.json` to the Live/WIP schema

**Files:**
- Modify: `src/data/code-projects.json`

**Interfaces:**
- Produces: each project object has `status: "live" | "wip"` (previously `"active" | "planned" | "done"`). All other fields (`name`, `category`, `description`, `tech`, `link`) are unchanged in shape.

- [ ] **Step 1: Replace the file contents**

Replace the entire contents of `src/data/code-projects.json` with:

```json
{
  "lastUpdated": "2026-07-07",
  "projects": [
    {
      "name": "Staub Racing Site",
      "status": "live",
      "category": "Websites",
      "description": "This site - motorcycle racing, coding projects, and life updates",
      "tech": ["Astro 5", "MDX", "TypeScript", "AWS S3", "CloudFront"],
      "link": "https://github.com/StaubRacing/staubracing.com"
    },
    {
      "name": "Chris Staub Site",
      "status": "live",
      "category": "Websites",
      "description": "Personal portfolio with clean, minimal design",
      "tech": ["HTML", "CSS", "Responsive Design"],
      "link": "https://chrisstaub.com"
    },
    {
      "name": "Moto-API",
      "status": "live",
      "category": "Backend",
      "description": "Serverless backend API for the Moto app with PostgreSQL",
      "tech": ["TypeScript", "Serverless Framework", "AWS Lambda", "PostgreSQL"],
      "link": null
    },
    {
      "name": "MoneyMap",
      "status": "live",
      "category": "AI/ML",
      "description": "AI-powered spending categorization with RAG and multiple LLM support",
      "tech": ["TypeScript", "LangChain", "OpenAI", "Anthropic", "PostgreSQL", "Express"],
      "link": null
    },
    {
      "name": "Updog Coffee",
      "status": "live",
      "category": "Client Work",
      "description": "Static website for local coffee shop client",
      "tech": ["HTML", "CSS"],
      "link": null
    },
    {
      "name": "Moto App Pro",
      "status": "wip",
      "category": "Mobile Apps",
      "description": "React Native motorcycle tracking app with offline support and AWS backend",
      "tech": [
        "React Native",
        "Expo 52",
        "TypeScript",
        "AWS Amplify",
        "React Navigation",
        "AWS Cognito",
        "AWS S3",
        "AWS CloudFront"
      ],
      "link": null
    },
    {
      "name": "Kiera Site",
      "status": "wip",
      "category": "Websites",
      "description": "Personal website project - planned redesign",
      "tech": ["HTML", "CSS"],
      "link": null
    },
    {
      "name": "Meal Planner",
      "status": "wip",
      "category": "Backend",
      "description": "Self-hosted family meal planner — weekly grid, recipe library, grocery list generator, and defrost planner. Planned for meals.staubracing.com",
      "tech": ["TypeScript", "Express", "PostgreSQL", "PM2"],
      "link": null
    }
  ]
}
```

- [ ] **Step 2: Validate JSON syntax**

Run: `node -e "JSON.parse(require('fs').readFileSync('src/data/code-projects.json', 'utf8')); console.log('valid')"`
Expected: `valid`

- [ ] **Step 3: Commit**

```bash
git add src/data/code-projects.json
git commit -m "feat: slim code-projects.json to live/WIP schema, drop dead AI/ML entries"
```

---

### Task 2: Update `code.astro` to group by Live/WIP

**Files:**
- Modify: `src/pages/code.astro`

**Interfaces:**
- Consumes: `codeProjectsData.projects[]` where each item has `status: "live" | "wip"`, `category: string`, `name: string`, `description: string`, `tech: string[]`, `link: string | null` (produced by Task 1).

- [ ] **Step 1: Replace the frontmatter grouping logic**

In `src/pages/code.astro`, replace lines 6-16 (the sort/group block) with:

```astro
// Group projects by status: Live first, then WIP
const statusOrder = { live: 0, wip: 1 };
const sortedProjects = [...codeProjectsData.projects].sort(
  (a, b) => statusOrder[a.status] - statusOrder[b.status]
);

const statusSections = [
  { key: 'live', heading: 'Live' },
  { key: 'wip', heading: 'WIP' },
] as const;
const projectsByStatus = Object.fromEntries(
  statusSections.map(({ key }) => [key, sortedProjects.filter(p => p.status === key)])
);
```

- [ ] **Step 2: Replace the template body**

Replace lines 26-58 (the `<section class="projects-section">...</section>` block) with:

```astro
    <section class="projects-section">
      {statusSections.map(({ key, heading }) => projectsByStatus[key].length > 0 && (
        <div class={`category-group status-${key}`}>
          <h3 class="category-heading">{heading}</h3>
          <div class="projects-grid">
            {projectsByStatus[key].map((project: any) => (
              <article class={`project-card status-${key}`}>
                <header class="project-header">
                  <h4>{project.name}</h4>
                </header>
                <p class="project-description">{project.description}</p>
                <div class="tech-tags">
                  <span class="tech-tag category-tag">{project.category}</span>
                  {project.tech && project.tech.map((t: string) => <span class="tech-tag">{t}</span>)}
                </div>
                {project.link && (
                  <a href={project.link} class="project-link" target="_blank" rel="noopener noreferrer">
                    View Project →
                  </a>
                )}
              </article>
            ))}
          </div>
        </div>
      ))}
    </section>
```

- [ ] **Step 3: Replace the status-badge CSS with status-accent CSS**

In the `<style>` block, replace the `.status-badge`, `.status-badge.active`, `.status-badge.planned`, and `.status-badge.done` rules (lines ~127-155) with:

```css
  .project-card.status-live {
    border-left: 3px solid var(--accent-lime);
  }

  .project-card.status-wip {
    border-left: 3px solid var(--accent-amber);
  }

  .category-tag {
    font-weight: 600;
    opacity: 0.8;
  }
```

- [ ] **Step 4: Typecheck**

Run: `yarn astro check`
Expected: no errors (pre-existing unrelated warnings, if any, are fine — there must be no new errors referencing `code.astro` or `code-projects.json`)

- [ ] **Step 5: Build**

Run: `yarn build`
Expected: build completes successfully, output written to `dist/`

- [ ] **Step 6: Visual check**

Run: `yarn preview`, open `http://localhost:4321/code`, confirm:
- Two headings appear in order: "Live" then "WIP"
- 5 cards under Live (Staub Racing Site, Chris Staub Site, Moto-API, MoneyMap, Updog Coffee), 3 under WIP (Moto App Pro, Kiera Site, Meal Planner)
- No card shows a status badge; each card shows a category tag as the first tag
- Live cards have a lime left border, WIP cards an amber left border

- [ ] **Step 7: Commit**

```bash
git add src/pages/code.astro
git commit -m "feat: group /code projects by Live/WIP instead of category"
```
