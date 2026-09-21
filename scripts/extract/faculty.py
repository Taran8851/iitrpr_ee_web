#!/usr/bin/env python3
"""Extract faculty cards from the legacy faculty page into src/data/faculty/faculty.json.

One-off migration helper. The legacy page dir has since been deleted, so the source
is read from git history when it is missing:
    python3 scripts/extract/faculty.py
"""
import html, json, re, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC_REL = "src/legacy/pages/faculty/body.html"
SRC = ROOT / SRC_REL
OUT = ROOT / "src/data/faculty/faculty.json"
CARD_SPLIT = r'<div class="row shadow-sm border rounded py-3 people_card my-3">'

GROUPS = {
    "Power Engineering": "power",
    "Microelectronics and VLSI Design": "vlsi",
    "Signal Processing and Communication": "spc",
    "Faculty Fellows": "fellows",
}
GROUP_LABELS = {
    "power": "Power Engineering",
    "vlsi": "Microelectronics & VLSI Design",
    "spc": "Signal Processing & Communication",
    "fellows": "Faculty Fellows",
}


def read_source() -> str:
    if SRC.exists():
        return SRC.read_text()
    return subprocess.run(
        ["git", "show", f"e3b7200:{SRC_REL}"],
        cwd=ROOT, check=True, capture_output=True, text=True,
    ).stdout


def text(fragment: str) -> str:
    return html.unescape(re.sub(r"<[^>]+>", "", fragment)).strip()


def squash(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip()


def dropdown_links(card: str, label: str) -> list[str]:
    m = re.search(label + r"\s*</button>\s*<ul[^>]*>(.*?)</ul>", card, re.S)
    if not m:
        return []
    return [html.unescape(h) for h in re.findall(r'href="([^"]*)"', m.group(1)) if h not in ("#", "")]


# Legacy strings that are run-on lists without separators.
INTEREST_OVERRIDES = {
    "bibhu": [
        "Power system dynamics & stability studies",
        "Synchrophasor technology & its applications",
        "State estimation in power systems",
        "Smart & Micro grids",
        "Cybersecurity in smart-grid",
        "Renewable energy integration",
    ],
}
# Short tags for entries whose interests are prose paragraphs (taken from that prose).
KEYWORDS = {
    "reddy": [
        "Nanodielectrics for power applications",
        "Ageing & life estimation",
        "Power equipment modelling",
        "Space charge in dielectrics",
        "Dielectric characterization",
    ],
}
PLACEHOLDER_PHOTOS = {"/images/legacy/41f3a7069fe2.png"}  # generic grey avatar


def split_interests(s: str) -> list[str]:
    s = squash(s).rstrip(".")
    # Split lists on commas/semicolons/sentence ends, but not inside parentheses.
    parts = re.split(r"(?:[;,]|\.(?= [A-Z]))\s*(?![^()]*\))", s)
    return [p.strip() for p in parts if p.strip()]


def parse_card(card: str, group: str, head: bool) -> dict:
    name = squash(text(re.search(r"<h[35][^>]*>(.*?)</h[35]>", card, re.S).group(1)))
    spans = re.findall(r'<span class="d-inline-block mt-1[^"]*">(.*?)</span>', card, re.S)
    designation = squash(text(spans[0]))
    edu_raw = text(spans[1])
    education = [squash(l) for l in edu_raw.splitlines() if l.strip()]
    interests_raw = text(re.sub(r"<b[^>]*>.*?</b>", "", spans[2], flags=re.S))
    if head:  # HoD entry is prose paragraphs, not a list
        interests = [squash(p) for p in re.split(r"\n\s*\n", interests_raw) if p.strip()]
    else:
        interests = split_interests(interests_raw)
    room = squash(text(spans[3])).rstrip(", ")
    email = re.search(r'href="mailto:([^"]+)"', card).group(1).strip()
    phone = squash(text(spans[5])) if len(spans) > 5 else ""
    profile = re.search(r"href='(/people/[^']+)'", card).group(1)
    scholar_m = re.search(r'<a href="([^"]+)"[^>]*class="external-link"[^>]*>.*?Scholar', card, re.S)
    scholar = html.unescape(scholar_m.group(1)) if scholar_m else ""
    if not scholar.startswith("http"):  # empty on the live site, rewritten to /faculty
        scholar = ""
    websites = [u for u in dropdown_links(card, "Personal Website") if u != profile]
    other = dropdown_links(card, "Other Links")
    photo = re.search(r'<img[^>]*?\ssrc="([^"]+)"', card).group(1)
    if photo in PLACEHOLDER_PHOTOS:
        photo = ""
    pid = profile.rsplit("/", 1)[1]
    interests = INTEREST_OVERRIDES.get(pid, interests)
    return {
        "id": pid,
        "name": name,
        "designation": designation,
        "group": group,
        "groupLabel": GROUP_LABELS[group],
        "head": head,
        "photo": photo,
        "education": education,
        "interests": interests,
        "keywords": KEYWORDS.get(pid, interests),
        "room": room,
        "email": email,
        "phone": phone,
        "profile": profile,
        "scholar": scholar,
        "website": websites[0] if websites else "",
        "otherLinks": websites[1:] + other,
    }


def main() -> None:
    src = read_source()
    cards = []
    head_html = src[: src.find('<div class="my-5 container mb-5">')]
    for card in re.split(CARD_SPLIT, head_html)[1:]:
        # HoD (high-voltage / dielectrics research) is listed under Power Engineering.
        cards.append(parse_card(card, "power", True))
    sections = re.split(r'<div id="([^"]*)" class="faculty_section[^"]*">', src)
    for sid, body in zip(sections[1::2], sections[2::2]):
        if sid not in GROUPS:
            continue  # Former / Retired Faculty are empty on the live site
        for card in re.split(CARD_SPLIT, body)[1:]:
            cards.append(parse_card(card, GROUPS[sid], False))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(cards, indent=2, ensure_ascii=False) + "\n")
    print(f"wrote {len(cards)} faculty to {OUT.relative_to(ROOT)}", file=sys.stderr)


if __name__ == "__main__":
    main()
