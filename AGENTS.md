# AGENTS.md — IIT Ropar EE Department Website

Guidance for any agent (or human) working in this repo. Read this before touching code.

## What this project is

A modernization of the Department of Electrical Engineering, IIT Ropar website
(live: https://www.iitrpr.ac.in/ee/). We start from a faithful static clone of the
live site and progressively rebuild it into a cleaner, more interactive interface.
Reference sites for look & feel:
- **Primary: sAIDE, IIT Ropar (https://saide.iitrpr.ac.in/)** — our sister school's site.
  We want "the Electrical Engineering version" of it: same modern feel, EE identity.
- Secondary: MIT EECS (https://www.eecs.mit.edu/) and IIT Bombay EE (https://www.ee.iitb.ac.in/web/)
  for information architecture (menus, news/events split, HOD message).

## Design direction

### What we take from sAIDE (observed from its markup/CSS)
- Dark navy/slate base (`#0b1629`, `#020617`) with light `slate-50/100` sections; light + dark mode
- **Glassmorphism**: `backdrop-blur-md` / `backdrop-blur-xl` panels over imagery, blurred sticky navbar
- Large soft **glow blobs** behind sections (`blur-[120px]`, low-opacity accent circles)
- Photo cards with dark gradient overlay (`from-[#020617]/88 to-transparent`) and text on top
- **Bento grid** for research domains, arrow-icon hover affordances
- Stat cards (students / faculty / publications / projects), events calendar + announcements,
  programs carousel, collaborators logo grid, news, gallery
- Fonts: Noto Sans (body) + Space Grotesk (display)

### What makes ours "Electrical"
- Accent colors read as *energy/current* rather than sAIDE's AI indigo (see palette options)
- Subtle EE motifs: circuit-trace SVG lines in hero/section backgrounds, a slow "current flow"
  animated stroke on dividers, waveform/sine accents — decorative, low-contrast, CSS/SVG only
- Research bento tiles: Power & Energy · VLSI & Microelectronics · Communication & Signal Processing ·
  Infrared Imaging & NDT · Devices & Photonics — keep the home page EE-first (no Computer Vision tile; user decision 2026-09-23)

### Blur usage rules (blur is a confirmed requirement)
- Navbar: glass (`bg-base-100/70 backdrop-blur-md`) once scrolled
- Hero: glass info panel / stat cards over a photo or video background
- Dropdowns / mega-menu and mobile drawer: glass
- Background glow blobs (large blurred accent circles) — max 2 per section
- Do NOT blur body text areas or long lists; keep contrast ≥ WCAG AA over any blurred surface

### Palette — undecided, implemented as a daisyUI custom theme so it is a one-file swap
| Option | Base | Primary | Secondary | Feel |
|---|---|---|---|---|
| A. Voltage | navy `#0b1629` / slate | electric amber `#f59e0b` | cyan `#06b6d4` | "high voltage", clearly distinct from sAIDE |
| B. Copper Circuit | navy `#0b1220` | copper `#b5622a` | teal `#1c6e6e` | from `docs/design.md`, most academic |
| C. Electric Blue | slate `#020617` | electric blue `#2563eb` | amber `#fbbf24` spark | closest to sAIDE family look |

Plan: build the home hero once, preview all three themes side by side, user picks.

## Guiding principles

1. **Minimal custom code.** Prefer an existing open-source library or a daisyUI
   component over writing our own. Hand-written JS/CSS is the last resort.
2. **Never break the site.** Every phase must leave a working, buildable site.
   Legacy pages keep rendering until their replacement is ready.
3. **One page at a time.** Rebuild a page fully, verify it, then move on.
4. **Content lives in data, not markup.** Faculty, news, events, achievements
   become content collections (JSON/Markdown), not hard-coded HTML.
5. **Static output.** The build must produce plain HTML/CSS/JS that can be hosted
   on any web server (including the institute's Apache/PHP server). No Node server.

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | [Astro](https://astro.build) | Static output, shared layouts, file-based routing |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) via `@tailwindcss/vite` | Utility classes |
| Components | [daisyUI v5](https://daisyui.com) | Ready-made navbar, dropdown, cards, tabs, carousel, modal, etc. — CSS only |
| Scroll animations | [AOS](https://michalsnik.github.io/aos/) | `data-aos="fade-up"` attributes, no custom JS |
| Carousels | [Swiper](https://swiperjs.com) | Already used by the legacy site |
| Lightbox | [GLightbox](https://biati-digital.github.io/glightbox/) | Photo galleries, lab/event images |
| Site search | [Pagefind](https://pagefind.app) (dev dep) | Runs after `astro build`, indexes `dist/` |

Not used on purpose: React/Vue islands (add only if a component truly needs
state), Bootstrap (legacy only — removed as pages are rebuilt), Three.js.

## Repo layout

```
legacy-site/        Static wget mirror of the live site (git-ignored reference). Do not edit.
docs/               Design docs (design.md + style references DESIGN(1..3).md, mockup)
assets/             media_assets.json (generated-image metadata)
AGENTS.md           This file (the plan)
package.json        Astro + deps
astro.config.mjs    Astro config (Tailwind vite plugin + astro-icon)
src/                Astro source: pages, components, layouts, data (JSON), scripts, styles
public/             static files: assets/, images/legacy/, favicon.png
scripts/            check-links.mjs + one-off extract/ scripts (read legacy HTML from git history)
```

A backup of the removed Next.js app + Prisma backend (faculty seed data with
Google Scholar IDs, news/achievement scrapers) exists outside the repo; the
seed data can be reused to populate content collections in Phase 3.

## Facts about the legacy clone (legacy-site/)

- 20 top-level pages + 24 faculty profile pages (`profile.faculty.php?mail=<user>@iitrpr.ac.in.html`).
- Bootstrap 5.0.2 + jQuery-free custom scripts in `scripts/`, 15 CSS files in `css/`.
- Every page shares an identical header (body start → `<!-- Navbar End(ed) -->`)
  and identical `<footer>`. Only differences are wget self-links (`<page>.html#`) — treat as `#`.
- Images are inlined as base64 data URIs (index.html ≈ 37 MB, one profile ≈ 22 MB).
  Some are mislabeled (JPEG bytes under `image/png`) — detect type by magic bytes.
- Known dead links on the live site (not missing from the clone): `css/assets/bg*.svg`,
  `scripts/loader.js`, `scripts/staff.filters.js`, a few malformed faculty links.
- Footer social icons all point to `#` on the live site.
- Theme switcher (yellow/coco/gray/red/blue) swaps `css/theme.css` via cookie. **Dropped** — replaced by a single light/dark toggle.
- A session "auto logout" timer banner is baked into the header include. **Dropped** — meaningless on a static public site.
- Other legacy cruft to drop while porting: commented-out loader markup, the "Faculty Login" block, dead `#` social links, the mis-fetched `chart.custom.js.html` page.

## Routes (target)

| Legacy file | New route |
|---|---|
| `index.html` | `/` |
| `<name>.php.html` | `/<name>` (e.g. `/faculty`, `/news`) |
| `profile.faculty.php?mail=<user>@iitrpr.ac.in.html` | `/people/<user>` |

Information architecture after redesign (MIT/IITB-inspired):
About · People (Faculty / Staff / Students / Alumni) · Research (Areas / Labs /
Projects / Publications) · Academics (Programs / Courses / Admissions) ·
News & Events · Placements · Contact.

## Plan

### Phase 0 — Setup ✅
- [x] Clone live site into `legacy-site/`
- [x] Install dependencies (astro, tailwindcss, @tailwindcss/vite, daisyui, aos, swiper, glightbox, pagefind)
- [x] Write this AGENTS.md

### Phase 1 — Port the clone into Astro (pixel-identical, no redesign) ✅
Goal: `npm run dev` shows the exact same site, but served by Astro.
- [x] Wire Tailwind + daisyUI (`astro.config.mjs`, `src/styles/global.css` with Voltage themes) — only for rebuilt pages; `LegacyLayout` never loads it
- [x] Migration script `scripts/migrate_legacy.py`: 67 base64 images → `public/images/legacy/<hash>.<ext>` (page HTML 73 MB → 3.7 MB)
- [x] Legacy `css/`, `scripts/`, `assets/` → `public/`, all paths root-absolute
- [x] Pages split into `src/legacy/pages/<slug>/{head,body,tail}.html`; shared `src/legacy/partials/{header,footer}.html`
- [x] Catch-all `src/pages/[...slug].astro` + `src/layouts/LegacyLayout.astro` render all 43 pages
- [x] Internal links rewritten to new routes; build link check: all 137 internal URLs resolve
- [x] Removed: theme switcher, auto-logout banner, dead loader markup (header partial, hand-edited),
      Faculty/Admin login forms (faculty page)

(Phase 1 scaffolding — catch-all route, `LegacyLayout`, `src/legacy/`, legacy `public/css|scripts`, `migrate_legacy.py` —
was removed on 2026-09-23 once every page was rebuilt. Recover from commit e3b7200 if ever needed.)

### Phase 2 — New shell (applies to every page) ✅
- [x] Header: glass sticky navbar (sAIDE-style), dropdowns for Research / People / Academics, mobile drawer, light/dark toggle
- [x] Footer: multi-column (brand · academics · quick links · contact), real social links, map link
- [x] Base layout: fonts, SEO meta, favicon, AOS init, glow-blob + circuit-trace background utilities
- [x] Three candidate daisyUI themes (Voltage / Copper Circuit / Electric Blue) — user picks after preview
- [x] Keep accessibility features from legacy: skip-to-content, screen-reader page, Google Translate
- [x] Remove theme switcher + auto-logout banner

### Phase 3 — Content as data ✅ (plain JSON in `src/data/<area>/`, not Astro collections)
- [x] `faculty` (from legacy profiles + old seed data: name, designation, email, room, areas, scholar link, photo)
- [x] `news`, `achievements`, `events` (seminars / workshops / visiting speakers)
- [x] `labs`, `projects`, `courses`, `staff`, `students`

### Phase 4 — Rebuild pages ✅ (10 parallel units, merged 2026-09-23)
1. [x] Home — the "EE version of sAIDE", in this order:
   1. Hero: full-bleed campus/lab photo + dark gradient, headline, glass panel with CTAs, circuit-trace motif
   2. Stat cards (glass): faculty · students · publications · projects · patents — animated counters
   3. Announcements + upcoming events (calendar-style date blocks) side by side
   4. Research bento grid (6 EE domains, photo tiles, gradient overlay, arrow on hover)
   5. Programs carousel (B.Tech · M.Tech · M.S. · Ph.D.) — Swiper
   6. HOD message (photo + short quote + "read more") — from IITB
   7. News & achievements cards
   8. Recruiters / collaborators logo grid (grayscale → color on hover)
   9. Gallery (GLightbox) — labs, events, campus
2. [x] People — faculty grid with search/filter by area; profile pages at `/people/<user>`
3. [x] News & Events — filterable archive, calendar-style event list
4. [x] Research — areas → labs → projects → publications
5. [x] Academics — programs, courses, admissions
6. [x] About, Placements, Facilities, Committees, Contact, Alumni, Team
7. [x] Remove legacy catch-all route + Bootstrap once nothing uses them

### Phase 5 — Polish & ship
- [ ] Pagefind site search in the header
- [ ] Image optimization via Astro `<Image />`
- [ ] Lighthouse pass (performance, accessibility, SEO)
- [ ] Deployment target — localhost only for now; revisit later

## Decisions log
- 2026-09-22: Stack = Astro + Tailwind v4 + daisyUI + AOS + Swiper + GLightbox + Pagefind; minimal custom code.
- 2026-09-22: Primary inspiration = sAIDE IIT Ropar; build the Electrical Engineering version.
- 2026-09-22: Blur/glassmorphism is a must-have (see Blur usage rules).
- 2026-09-22: Drop legacy theme switcher and auto-logout banner.
- 2026-09-22: Hosting = localhost for now.
- 2026-09-23: Full redesign landed; legacy clone code removed. Light theme darkens text-primary to amber-700 for AA contrast.
- 2026-09-22: Palette = Voltage (navy + electric amber + cyan) as the working choice; revisit later.

## Known content gaps (need department input)
- Placement charts use the legacy site's dummy data (labelled "Illustrative").
- Publications list = 623 items aggregated from faculty profiles; live DB claimed 743.
- M.Sc./Ph.D. course lists and M.Tech/M.S./Ph.D. admission details were empty/placeholder in legacy.
- No recruiter logos; alumni affiliations were all "To Be Updated".
- Hand-written copy to review: home hero subline, programme blurbs, research-area summaries.
- SECURITY: the live site's publications DB contains a defacement entry (`<script src=…jso.defacer.id…>`); report to the site admins.

## Open decisions (ask the user)
- Color palette: Voltage for now; Copper Circuit / Electric Blue can still be previewed later
- Real photos for hero / research tiles / gallery — source from department or placeholders?
- Exact research-area list for the bento grid

## Commands

```bash
npm run dev       # dev server (http://localhost:4321)
npm run build     # static build → dist/
npm run preview   # preview the build
npx pagefind --site dist   # build search index (Phase 5)
```

Serve the raw legacy clone for side-by-side comparison:
```bash
cd legacy-site && python3 -m http.server 8090
```

## Conventions
- Astro components in `src/components/`, layouts in `src/layouts/`, content in `src/content/`.
- Prefer daisyUI class names (`btn`, `card`, `navbar`, `dropdown`, `tabs`) over custom CSS.
- Animations: AOS attributes only; no hand-rolled IntersectionObserver code.
- Do not edit files in `legacy-site/` — it is the reference snapshot.
- Do not commit `node_modules/`, `dist/`, `.astro/`.

## Redesign kit (use these — do not re-invent)
- Layout: `src/layouts/BaseLayout.astro` (`title`, `description`, `overlayHeader` for a hero under a transparent header).
- Shell: `src/components/site/{Header,Footer}.astro`, menu data in `src/lib/nav.ts`.
- UI: `src/components/ui/` — `PageHero`, `Section` (`tint`), `SectionHeading`, `GlassCard` (`href`, `dark`),
  `StatCard` (count-up), `PersonCard`, `SearchInput`, `EmptyState` (`filter`), `GlowBlobs`, `CircuitBg`.
- CSS utilities (global.css): `glass`, `glass-dark`, `photo-overlay`, `current-flow`; fonts `font-display` / `font-sans`;
  Tailwind `dark:` variant follows the `voltage-dark` theme.
- Behaviour (`src/scripts/site.ts`, loaded once): theme toggle, AOS (`data-aos`), GLightbox (`.glightbox`),
  count-up (`data-countup`), filtering (`data-filter-root` / `-search` / `-group` / `-select` / `-item` / `-empty` / `-count`).
- Icons: `astro-icon` with Lucide — `<Icon name="lucide:arrow-right" />`.
- Page data: JSON in `src/data/<area>/`, imported directly in the page frontmatter.
- Verify: `npm run build && npm run check:links`.
- Research graph: `/research-graph` (force-graph) reads `/api/research-graph.json` (static endpoint) or
  `PUBLIC_RESEARCH_GRAPH_URL` (live backend, same schema). Contract + Scholar sync: `docs/research-graph-api.md`,
  `src/lib/research-graph.ts`, `scripts/scholar/sync_scholar.py`, topic rules in `src/data/graph/topics.json`.
