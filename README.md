# Department of Electrical Engineering, IIT Ropar — Website Redesign

A modern, interactive redesign of the [IIT Ropar EE department website](https://www.iitrpr.ac.in/ee/),
built as a fast static site with [Astro](https://astro.build). It keeps all of the department's real
content (faculty, students, courses, labs, projects, publications, news) and presents it with a
glassmorphism "Voltage" design, light/dark mode, rich interactions and an interactive research graph.

> Inspiration: [sAIDE, IIT Ropar](https://saide.iitrpr.ac.in/) for look & feel, plus MIT EECS and
> IIT Bombay EE for information architecture — rebuilt with an Electrical Engineering identity.

---

## Highlights

| | |
|---|---|
| **43 pages + API** | Home, About, Faculty (+ 23 profiles), Staff, Students, Alumni, Team, Research Areas, Labs, Facilities, Projects, Publications, Research Graph, Courses, Admissions, Committees, News, Achievements, Placements, Contact, Accessibility |
| **Research Graph** | `/research-graph` — interactive force-directed map linking **professors ⇄ topics ⇄ 620+ papers**; hover traces "current" through links, click for details, filter by domain / type / year, deep links (`?focus=reddy`) |
| **Backend-ready data API** | `GET /api/research-graph.json` (static) or a live backend via `PUBLIC_RESEARCH_GRAPH_URL`; Google Scholar sync script included |
| **Interactions** | Cursor spotlight on glass cards, 3D tilt, magnetic buttons, particle-network hero, live circuit that lights up under the cursor, faculty quick-view modals (← → to browse), mega-menus, Ctrl/⌘ K site search, smooth page transitions, scroll progress |
| **Content as data** | Every page is driven by JSON in `src/data/` — no content hard-coded in markup |
| **Static output** | Plain HTML/CSS/JS in `dist/`; host on any web server (institute Apache/PHP server, GitHub Pages, Netlify, …) |
| **Accessible** | Skip link, keyboard-navigable menus/modals, reduced-motion support, AA contrast in both themes, screen-reader page |

## Tech stack

| Layer | Tool |
|---|---|
| Framework | Astro 7 (static output) |
| Styling | Tailwind CSS v4 + daisyUI v5 (custom **Voltage** light/dark themes) |
| Icons & fonts | astro-icon (Lucide), Space Grotesk + Noto Sans (Fontsource) |
| Motion & interaction | AOS, Swiper, GLightbox, vanilla-tilt, tsParticles |
| Graph | force-graph (canvas, d3-force) |
| Search | Pagefind (index built at `astro build`) |

Minimal custom code by design — open-source libraries and daisyUI components first.

## Getting started

Requirements: **Node.js ≥ 22.12**.

```bash
npm install
npm run dev          # http://localhost:4321
```

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Static build to `dist/` + Pagefind search index |
| `npm run preview` | Serve the production build locally |
| `npm run check:links` | Verify every internal link/asset in `dist/` resolves (run after build) |

> Search (Ctrl/⌘ K) uses the index from the last `npm run build`; run a build once before using it in dev.

## Project structure

```
src/
  pages/                 one .astro file per route (people/[id].astro = 23 faculty profiles)
    api/research-graph.json.ts   static JSON endpoint for the research graph
  layouts/BaseLayout.astro       <head>, theme, header/footer, site script
  components/
    site/                Header (mega-menus, search, theme toggle), Footer
    ui/                  shared kit: PageHero, Section, GlassCard, StatCard, PersonCard, …
    home/ faculty/ profile/ graph/ research/ research-output/ academics/ students/ news/ about/
  data/                  all page content as JSON (faculty, people/<id>, courses, labs, news, …)
    graph/topics.json    research-topic keyword rules used to tag papers
  lib/                   nav.ts (menus + contact), research-graph.ts (graph schema + helpers)
  scripts/site.ts        the single client script (theme, filters, count-up, spotlight, tilt, modals…)
  styles/global.css      Tailwind + daisyUI themes + glass / circuit / transition utilities
public/                  images (assets/, images/legacy/), favicon
scripts/
  check-links.mjs        link checker
  scholar/sync_scholar.py        Google Scholar → research-graph papers
  extract/               one-off scripts used to extract content from the original site
docs/
  research-graph-api.md  research graph data contract + Scholar workflow
  design.md, DESIGN(1-3).md      design notes and style references
AGENTS.md                project plan, design rules, decisions log, known content gaps
```

## Editing content

Content lives in JSON — edit the file, the page updates:

| Page | File |
|---|---|
| Faculty directory / quick views | `src/data/faculty/faculty.json` |
| Faculty profile | `src/data/people/<id>.json` |
| Home (hero, stats, news, research tiles, programmes) | `src/data/home/*.json` |
| News, achievements | `src/data/news/*.json` |
| Courses, admissions | `src/data/academics/*.json` |
| Labs, facilities, research areas | `src/data/research/*.json` |
| Projects, publications | `src/data/research-output/*.json` |
| Students, alumni | `src/data/students/*.json` |
| Menus, contact details | `src/lib/nav.ts` |

The colour palette is a single daisyUI theme in `src/styles/global.css` (`voltage` / `voltage-dark`).

## Research graph & Scholar integration

The graph page reads one JSON document (`ResearchGraphData`, see `src/lib/research-graph.ts`):

- **Static (default):** built from the website's publications (+ `src/data/graph/scholar-papers.json` if present).
- **Live backend:** set `PUBLIC_RESEARCH_GRAPH_URL` in `.env` and rebuild; the page fetches it at runtime
  and falls back to the static file if unreachable.
- **Google Scholar:** `scripts/scholar/sync_scholar.py` pulls each professor's papers into the same schema:

```bash
python3 -m venv .venv && .venv/bin/pip install scholarly
.venv/bin/python scripts/scholar/sync_scholar.py --limit 100
npm run build
```

Full contract and rules: [`docs/research-graph-api.md`](docs/research-graph-api.md).

## Deployment

`npm run build` produces a self-contained static site in `dist/`. Upload it to any web server's
document root (it uses root-relative URLs, so serve it at a domain/sub-domain root, or set Astro's
`base` option for a sub-path such as `/ee/`).

## Content notes

Content was migrated from the live department website. Items that need department input are tracked
in `AGENTS.md → Known content gaps` (e.g. placement charts use illustrative data, a few programme
descriptions are placeholders, publication list is aggregated from faculty profiles).

**Security note for the site administrators:** the original site's publication database contains an
injected `<script>` entry (a defacement). It has been excluded from this redesign, but should be removed
from the live database and the entry point investigated.

## Credits

Content © Department of Electrical Engineering, IIT Ropar. Redesign built with open-source software
(Astro, Tailwind CSS, daisyUI, force-graph, tsParticles, Pagefind, and others listed in `package.json`).
