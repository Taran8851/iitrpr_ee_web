"""
Pull faculty publications from Google Scholar into the research-graph schema.

Writes src/data/graph/scholar-papers.json — a list of GraphPaper objects
(see src/lib/research-graph.ts / docs/research-graph-api.md). `npm run build`
merges it into /api/research-graph.json. A backend can import fetch_papers().

Usage:
    python3 -m venv .venv && .venv/bin/pip install scholarly
    .venv/bin/python scripts/scholar/sync_scholar.py [--limit 100] [--only reddy bibhu]
"""

import argparse
import json
import re
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
FACULTY = ROOT / "src" / "data" / "faculty" / "faculty.json"
OUT = ROOT / "src" / "data" / "graph" / "scholar-papers.json"
DELAY_SECONDS = 5  # be polite: Scholar rate-limits aggressive scraping


def scholar_id(url: str | None) -> str | None:
    m = re.search(r"[?&]user=([\w-]+)", url or "")
    return m.group(1) if m else None


def guess_type(venue: str) -> str:
    v = venue.lower()
    if "patent" in v:
        return "Patent"
    if any(k in v for k in ("conference", "proceedings", "symposium", "workshop", "conf.")):
        return "Conference"
    if any(k in v for k in ("book", "chapter", "springer nature")) and "journal" not in v:
        return "Book/Chapter"
    return "Journal"


def fetch_papers(sid: str, limit: int = 100) -> list[dict]:
    """Return up to `limit` publications for one Scholar profile (GraphPaper dicts, no faculty/topics)."""
    from scholarly import scholarly  # imported lazily so the module loads without the dependency

    author = scholarly.fill(scholarly.search_author_id(sid), sections=["publications"])
    papers = []
    for pub in author.get("publications", [])[:limit]:
        bib = pub.get("bib", {})
        title = (bib.get("title") or "").strip()
        if not title:
            continue
        venue = (bib.get("citation") or bib.get("venue") or "").strip()
        year = bib.get("pub_year")
        papers.append(
            {
                "title": title,
                "year": int(year) if str(year).isdigit() else None,
                "type": guess_type(venue),
                "venue": venue or None,
                "authors": None,
                "link": pub.get("pub_url")
                or f"https://scholar.google.com/citations?view_op=view_citation&citation_for_view={pub.get('author_pub_id', '')}",
                "citations": pub.get("num_citations", 0),
                "source": "scholar",
            }
        )
    return papers


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--limit", type=int, default=100, help="max papers per professor")
    ap.add_argument("--only", nargs="*", help="faculty ids to sync (default: all with a Scholar id)")
    args = ap.parse_args()

    faculty = json.loads(FACULTY.read_text())
    targets = [
        (f["id"], scholar_id(f.get("scholar")))
        for f in faculty
        if scholar_id(f.get("scholar")) and (not args.only or f["id"] in args.only)
    ]
    if not targets:
        print("No faculty with a Google Scholar id matched.", file=sys.stderr)
        return 1

    # Merge by title so co-authored papers list every faculty member once.
    by_title: dict[str, dict] = {}
    for i, (fid, sid) in enumerate(targets):
        print(f"[{i + 1}/{len(targets)}] {fid} ({sid})…", flush=True)
        try:
            for p in fetch_papers(sid, args.limit):
                key = re.sub(r"[^a-z0-9]+", " ", p["title"].lower()).strip()
                entry = by_title.setdefault(key, {**p, "faculty": []})
                if fid not in entry["faculty"]:
                    entry["faculty"].append(fid)
        except Exception as e:  # keep going; one blocked profile shouldn't lose the rest
            print(f"  failed: {e}", file=sys.stderr)
        if i < len(targets) - 1:
            time.sleep(DELAY_SECONDS)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(list(by_title.values()), indent=2, ensure_ascii=False) + "\n")
    print(f"Wrote {len(by_title)} papers to {OUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
