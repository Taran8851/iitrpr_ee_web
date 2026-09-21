# Research Graph API

The `/research-graph` page renders a network of **professors ⇄ topics ⇄ papers**.
It reads one JSON document with the shape below. Two ways to feed it:

| Mode | How | When |
|---|---|---|
| **Static** (default) | `GET /api/research-graph.json`, generated at `astro build` by `src/pages/api/research-graph.json.ts` | Always available; merges website publications + `src/data/graph/scholar-papers.json` if present |
| **Live backend** | Set `PUBLIC_RESEARCH_GRAPH_URL=https://your-api/research-graph` (in `.env`) and rebuild | Your backend serves the same shape (e.g. Scholar papers refreshed nightly). The page falls back to the static file if the backend is down |

The backend must allow CORS from the site's origin.

## Schema (v1) — `ResearchGraphData`

TypeScript source of truth: `src/lib/research-graph.ts`.

```jsonc
{
  "version": 1,
  "generatedAt": "2026-09-23T02:48:31.000Z",
  "source": "website+scholar",
  "faculty": [
    { "id": "reddy", "name": "C. C. Reddy", "designation": "Professor", "group": "power",
      "groupLabel": "Power Engineering", "photo": "/images/legacy/…jpg",
      "profile": "/people/reddy", "scholarId": "Oz5tUxkAAAAJ" }
  ],
  "topics": [
    { "id": "high-voltage", "label": "High Voltage & Dielectrics", "domain": "power",
      "keywords": ["dielectric", "insulation", "space charge"] }
  ],
  "papers": [
    { "id": "p1", "title": "…", "year": 2024, "type": "Journal", "venue": "IEEE Trans. …",
      "authors": "…", "link": "https://doi.org/…", "citations": 12,
      "faculty": ["reddy"], "topics": ["high-voltage"], "source": "scholar" }
  ]
}
```

Rules:
- `faculty[].id` must match the site's profile ids (`/people/<id>`, see `src/data/faculty/faculty.json`).
- `papers[].faculty` lists faculty ids; unknown ids are ignored.
- `papers[].topics` is **optional** — if omitted or empty, the page auto-tags from `topics[].keywords`
  (word-start match on title + venue; tokens ≤ 4 chars must match as whole words).
- `domain` ∈ `power` | `spc` | `vlsi` (controls colour + domain filter).
- `type` ∈ `Journal` | `Conference` | `Patent` | `Book/Chapter` (other values show but can't be filtered).

## Pulling papers from Google Scholar

`scripts/scholar/sync_scholar.py` reads each professor's Scholar id from `faculty.json`, fetches their
publications with [`scholarly`](https://github.com/scholarly-python-package/scholarly), and writes
`src/data/graph/scholar-papers.json` (a list of `papers` in the schema above, without topics).
Next `npm run build` merges them (deduplicated by title) into `/api/research-graph.json`.

```bash
python3 -m venv .venv && .venv/bin/pip install scholarly
.venv/bin/python scripts/scholar/sync_scholar.py --limit 100        # all faculty with a Scholar id
.venv/bin/python scripts/scholar/sync_scholar.py --only reddy bibhu  # a subset
npm run build
```

Google Scholar rate-limits scraping; the script sleeps between profiles. Run it weekly (cron), not per request.
A backend can import the same script (`fetch_papers(scholar_id)`) and serve the full document instead.
