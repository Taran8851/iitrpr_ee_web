# IIT Ropar EE Department — Design Doc
> Date: 2026-09-22 | Status: DRAFT — awaiting review
> Scope: redesign of https://www.iitrpr.ac.in/ee/ — minimal, institutional, light 3D accents

## TL;DR
Sharp, minimal, academic-serious layout (inspired by Copy.ai's flat 4px-radius architecture and ethereum.org's editorial content rhythm), rendered in an EE-appropriate deep-navy + copper/amber palette instead of any startup violet. 3D is scoped to two tasteful moments only: a slow-rotating circuit/PCB motif in the hero, and a subtle hover-tilt on cards. Everything else is flat, whitespace-separated, and content-dense in a controlled way — built for a department site, not a product landing page.

---

## 1. Why this direction (rejected alternatives)
Three style references were provided (Dala — dark particle constellation; Copy.ai — sharp violet enterprise; ethereum.org — lilac illustration editorial). None fit as-is:
- **Dala**: too consumer/startup — glowing brain particle fields and violet pill buttons read as a SaaS demo, not a university department.
- **Copy.ai**: right *architecture* (sharp corners, flat cards, no shadow elevation) but wrong *color* (violet is a marketing brand color, not academic).
- **ethereum.org**: right *content rhythm* (eyebrow labels, alternating panels) but wrong *imagery* (duotone illustration-first is too playful/crypto for an EE dept).

So: borrow structure from Copy.ai + ethereum.org, discard their brand colors, and design a new institutional palette rooted in the department's actual identity (electrical engineering → circuits, copper, navy/steel).

Also incorporated (Turn 3 research):
- IIT Bombay EE: "From the HOD" welcome block, narrative research/heritage sections, latest-news ticker.
- MIT EECS: card-grid news with thumbnails+dates, dedicated "Upcoming Events" widget, faculty directory as its own page.

---

## 2. Color Tokens

| Name | Value | Token | Role |
|------|-------|-------|------|
| Ink Navy | `#0b1220` | `--color-ink-navy` | Primary text, headings, dark surfaces (footer, nav-on-scroll) |
| Slate | `#3d4a5c` | `--color-slate` | Secondary body text |
| Fog | `#6b7686` | `--color-fog` | Muted/tertiary text, captions, timestamps |
| Hairline | `#dde3e8` | `--color-hairline` | Borders, dividers — the only border tone |
| Paper | `#f7f9fb` | `--color-paper` | Page canvas (off-white, cool) |
| Card White | `#ffffff` | `--color-card-white` | Card surfaces, nav bar |
| Copper | `#b5622a` | `--color-copper` | **Primary accent** — CTAs, active nav state, links, eyebrow labels |
| Copper Deep | `#8a4a1e` | `--color-copper-deep` | Hover state on copper elements |
| Circuit Teal | `#1c6e6e` | `--color-circuit-teal` | Secondary accent — category tags only (Power/VLSI/Signal Processing color-coding), never for CTAs |
| Amber Signal | `#e0a63e` | `--color-amber-signal` | Sparse highlight — "live/upcoming event" badges only |

**Rule:** Copper is the *only* CTA/link color. Teal and Amber are reserved for taxonomic tagging (research area, event status) — never for buttons. This mirrors the "one saturated accent" discipline from all three references, adapted to an academic palette.

## 3. Typography

- **Font:** Inter (matches ethereum.org/Copy.ai choice — free, fast, excellent at small sizes for dense academic content; no custom font licensing needed for an institutional site).
- **Headings:** weight 700, tight tracking (-0.02em at 32px+), left-aligned always (never centered body copy).
- **Body:** weight 400 at 16px, 1.6 line-height — comfortable for long faculty bios/research descriptions.
- **Eyebrow labels:** weight 600, 12px, uppercase, 0.04em tracking, Copper color — sits above every section heading ("RESEARCH AREA", "UPCOMING EVENT", "FACULTY").

| Role | Size | Weight | Line-height | Tracking |
|---|---|---|---|---|
| eyebrow | 12px | 600 | 1.4 | 0.04em |
| body-sm | 14px | 400 | 1.5 | normal |
| body | 16px | 400 | 1.6 | normal |
| heading-sm | 20px | 600 | 1.3 | -0.01em |
| heading | 28px | 700 | 1.25 | -0.015em |
| heading-lg | 40px | 700 | 1.15 | -0.02em |
| display | 56px | 700 | 1.1 | -0.02em |

## 4. Shape & Spacing

- **Border radius:** 4px universal (cards, buttons, inputs, tags, images) — sharp/architectural, deliberately *not* pill-shaped. Reads institutional, not consumer-app.
- **Base spacing unit:** 4px. Scale: 4/8/12/16/24/32/48/64/96px.
- **Elevation:** No drop shadows on default cards — separation via `1px solid var(--color-hairline)` + background contrast (Card White on Paper canvas), matching Copy.ai's discipline. Shadows reserved only for the hero's 3D element and hover-tilt cards (see §6).
- **Page max-width:** 1200px, centered.
- **Section gap:** 64–96px vertical.

## 5. Components

- **Primary Button** — Copper fill, white text, 4px radius, 12px/24px padding, weight 600. No shadow. Hover → Copper Deep.
- **Ghost Button** — transparent, 1px Hairline border, Ink Navy text, 4px radius. Used for secondary actions ("View all", "Learn more").
- **Eyebrow + Heading + Subtext block** — the standard section-intro pattern (ethereum.org-inspired), used atop every major section.
- **News/Achievement Card** — White card, 1px Hairline border, 4px radius, 24px padding, date badge (Fog text, small caps), title (heading-sm), 2-line description clamp, category tag (Teal/Amber pill, 4px radius).
- **Faculty Card** — Photo (4px radius, not circular — keeps the architectural language), name (heading-sm), designation (Copper, 12px uppercase), research tags, room/email/scholar-link row. Subtle 3D tilt on hover (see §6).
- **Event/Seminar Card** — Same base as News Card + a left-edge 3px Copper accent bar to distinguish "actionable/upcoming" content from passive news.
- **Company Logo Strip** — grayscale logos on Paper background, full color on hover, no card container (ethereum.org "Integration Logo Strip" pattern).
- **Nav Bar** — White, 64px height, bottom 1px Hairline border, logo left, links center (Home/About/People/Research/Seminars & Events/Companies/Contact), Copper active-state underline, no mega-dropdown (keeps institutional simplicity — rejected MIT's heavier mega-menu for a smaller dept site).
- **Footer** — Ink Navy background, white/fog text, working social links (fixing the current site's dead `#` social icons), quick-links + opportunities + contact columns retained from the current IA.

## 6. The "bit of 3D" — scoped narrowly

Per your ask for "minimal, institutional, maybe bit 3D" — two moments only, nothing site-wide:

1. **Hero circuit motif** — a slow, continuous auto-rotating low-poly 3D object (stylized IC chip / coil / PCB trace mesh) rendered via a lightweight Three.js scene (or a CSS/SVG animated fallback if we want zero extra JS weight), in Copper/Teal tones, sitity to the right of the hero headline. Muted, ambient — not the page's main focus, echoes EE identity instead of generic particles.
2. **Card hover-tilt** — faculty/news/event cards get a subtle `perspective()` + `rotateX/Y` tilt (2–4deg max) plus a soft elevation shadow *only on hover* — cheap CSS, no library needed, reads "premium" without breaking the flat-elevation rule at rest.

Everything else (nav, footer, section panels, buttons) stays strictly flat — no shadows, no gradients, no parallax scrolling. This keeps the 3D feeling special rather than gimmicky.

## 7. Page/Content Structure (Home)

1. **Nav bar** (sticky, flat white)
2. **Hero** — eyebrow ("DEPARTMENT OF ELECTRICAL ENGINEERING"), display headline + one-line mission statement, primary+ghost CTA pair, 3D circuit motif right
3. **Latest News** — card grid (MIT-style thumbnails+dates), "View all" ghost button
4. **From the HOD** — photo + short welcome message + CTA (IITB-inspired)
5. **Research Areas** — alternating text+visual panels (Power / VLSI & Microelectronics / Signal Processing & Communication), each with representative imagery
6. **Upcoming: Seminars / Workshops / Visiting Speakers** — unified timeline/card view, Copper accent-bar cards, "Notify me" email capture (no auth, per Turn 5 scope)
7. **Companies & Industry Collaboration** — logo strip + short blurb per relationship type (Recruiter / Research Partner / Sponsor)
8. **Achievements ticker** — compact scrolling/paginated strip, auto-synced later (backend paused per current instruction)
9. **Footer** — Ink Navy, real links, contact, quick-links

## 8. Explicit Do's and Don'ts

### Do
- Use Copper (`#b5622a`) as the only button/link/active-nav color.
- Keep every corner radius at 4px — no pills, no large rounded cards.
- Left-align all headings and body copy; eyebrow label above every section heading.
- Separate cards with hairline border + whitespace, not shadows, at rest.
- Reserve the two 3D moments (hero motif, card hover-tilt) — don't add 3D anywhere else.

### Don't
- Don't introduce a second saturated CTA color.
- Don't use pill-shaped (9999px) buttons anywhere.
- Don't add drop shadows to cards/nav/footer at rest.
- Don't center body paragraphs.
- Don't let the hero 3D motif be interactive/distracting — slow ambient rotation only.

---

## 9. Quick Start — CSS Tokens

```css
:root {
  --color-ink-navy: #0b1220;
  --color-slate: #3d4a5c;
  --color-fog: #6b7686;
  --color-hairline: #dde3e8;
  --color-paper: #f7f9fb;
  --color-card-white: #ffffff;
  --color-copper: #b5622a;
  --color-copper-deep: #8a4a1e;
  --color-circuit-teal: #1c6e6e;
  --color-amber-signal: #e0a63e;

  --radius: 4px;
  --page-max-width: 1200px;
  --section-gap: 80px;

  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
}
```

---

## Open for your feedback
- Palette (Copper/Navy/Teal) — keep, or prefer IIT Ropar's actual official brand colors instead?
- 3D hero motif — Three.js real 3D vs. a cheaper CSS/SVG animated approximation?
- Any section in §7 to add/remove/reorder before I build the GUI?
