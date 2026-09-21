#!/usr/bin/env python3
"""
Extract faculty profile data from the legacy clone into src/data/people/<id>.json.

Source: src/legacy/pages/people/<id>/body.html (as ported in Phase 1). Those dirs were
deleted once /people/[id] was rebuilt, so to re-run, restore them first
(`git checkout 639c53b -- src/legacy/pages/people`). The JSON is now the source of truth —
hand edits to it are expected; re-running overwrites them.

    python3 scripts/extract/people.py
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "src/legacy/pages/people"
OUT = ROOT / "src/data/people"

PLACEHOLDER = re.compile(r"^\[?\s*to be updated\s*\]?$", re.I)


def text(fragment: str) -> str:
    """Strip tags/comments, unescape entities, collapse whitespace."""
    fragment = re.sub(r"<!--.*?-->", " ", fragment, flags=re.S)
    fragment = re.sub(r"<br\s*/?>", " ", fragment, flags=re.I)
    fragment = re.sub(r"<[^>]+>", " ", fragment)
    s = html.unescape(fragment).replace(" ", " ")
    s = re.sub(r"\s+", " ", s).strip()
    s = re.sub(r"\s+([,.;:])", r"\1", s)
    return s


def paragraphs(fragment: str) -> list[str]:
    """Split prose into paragraphs on <p>/<br> boundaries."""
    fragment = re.sub(r"<[^>]*$", "", fragment)  # drop a tag cut off by between()
    fragment = re.sub(r"<!--.*?-->", " ", fragment, flags=re.S)
    parts = re.split(r"</p>|<p[^>]*>|<br\s*/?>\s*(?:<br\s*/?>)?|\n\s*\n", fragment, flags=re.I)
    return [t for t in (text(p) for p in parts) if t and not PLACEHOLDER.match(t)]


def strip_num(s: str) -> str:
    # "1. 1. Faculty-in-charge" -> "Faculty-in-charge"
    return re.sub(r"^(?:\d{1,3}\.\s+)+", "", s).strip()


def between(s: str, start: str, end: str, frm: int = 0) -> str:
    i = s.find(start, frm)
    if i < 0:
        return ""
    j = s.find(end, i + len(start))
    return s[i : j if j >= 0 else len(s)]


def lis(fragment: str) -> list[str]:
    items = [strip_num(text(m)) for m in re.findall(r"<li[^>]*>(.*?)</li>", fragment, flags=re.S)]
    return [i for i in items if i and not PLACEHOLDER.match(i)]


DEGREE = re.compile(
    r"^(Ph\.?\s?D|Doctor|M\.?\s?Tech|M\.?\s?E\b|ME\b|ME\(|M\.?\s?Sc|M\.?\s?Eng|Master|B\.?\s?Tech|B\.?\s?E\b|BE\b|B\.?\s?Eng|Bachelor)",
    re.I,
)


def merge_quals(items: list[str]) -> list[str]:
    """Legacy stored qualifications comma-joined then split on commas — re-join fragments."""
    out: list[str] = []
    for it in items:
        if out and not DEGREE.match(it):
            out[-1] = f"{out[-1]}, {it}"
        else:
            out.append(it)
    return out


def merge_parens(items: list[str]) -> list[str]:
    """Re-join items split inside parentheses: 'drives (Induction', 'SRM', 'IPMSM)'."""
    out: list[str] = []
    for it in items:
        if out and out[-1].count("(") > out[-1].count(")"):
            out[-1] = f"{out[-1]}, {it}"
        else:
            out.append(it)
    return out


def interests_list(items: list[str]) -> list[str]:
    items = merge_parens(items)
    # A prose paragraph that was comma-split: long items plus lower-case fragments.
    if any(len(i.split()) > 10 for i in items) and any(i[:1].islower() for i in items):
        return [", ".join(items)]
    return items


# Affiliations comma-split beyond repair by rule — restored by hand from the legacy text.
AFFILIATIONS = {
    "reddy": [
        "Research Fellow (after doctoral degree), IISc Bangalore — Jan 2008 to Feb 2008",
        "Senior R&D Engineer, J-Power Systems Corp. (JPS), Japan / Hitachi, Japan — Feb. 2008 to Dec. 2011",
        "Assistant Professor, IIT Ropar — Dec. 2011 to Dec. 2015",
        "Associate Professor, IIT Ropar — Dec. 2015 to Nov. 2021",
        "Professor, IIT Ropar — since Nov. 2021",
    ],
    "r.brajesh": [
        "Assistant Professor, Indian Institute of Technology Ropar, Punjab, India — from 1 May 2018 to 05-06-2025",
        "Senior Research Fellow, CENTD, Indian Institute of Technology Guwahati, Assam, India",
    ],
}


def merge_affiliations(pid: str, items: list[str]) -> list[str]:
    if pid in AFFILIATIONS:
        return AFFILIATIONS[pid]
    out: list[str] = []
    for it in items:
        if out and out[-1] in ("Senior Member", "Member"):
            out[-1] = f"{out[-1]}, {it}"
        else:
            out.append(it)
    return out


def clean(row: dict) -> dict:
    return {k: v for k, v in row.items() if v and v.strip(" -") and not PLACEHOLDER.match(v)}


def good_url(href: str, pid: str) -> str | None:
    href = html.unescape(href or "").strip()
    if not href or href == "#" or href.startswith("/people/") or "To Be Updated" in href:
        return None
    if href.startswith("www."):
        href = "https://" + href
    return href


def dropdown_links(block: str, pid: str) -> list[dict]:
    out = []
    for href, label in re.findall(r'<a[^>]*href="([^"]*)"[^>]*>(.*?)</a>', block, flags=re.S):
        url = good_url(href, pid)
        lab = text(label)
        if url and not PLACEHOLDER.match(lab):
            out.append({"label": lab or url, "href": url})
    return out


def pubs(fragment: str) -> list[dict]:
    items = []
    for li in re.findall(r"<li[^>]*>(.*?)</li>", fragment, flags=re.S):
        li = re.sub(r"<!--.*?-->", "", li, flags=re.S)

        def cls(name):
            m = re.search(rf'<(?:span|strong)[^>]*class="{name}[^"]*"[^>]*>(.*?)</(?:span|strong)>', li, flags=re.S)
            return text(m.group(1)).strip(" ,") if m else ""

        title = cls("title").strip('"“” ,')
        link = re.search(r'<a[^>]*href="([^"]*)"', li)
        url = good_url(link.group(1), "") if link else None
        if url:
            url = re.sub(r"^https?://doi\.org/(https?://)", r"\1", url)
            if re.fullmatch(r"https?://doi\.org/?", url):
                url = None
        item = {
            "authors": cls("author"),
            "title": title,
            "venue": cls("journal"),
            "volume": cls("volume"),
            "pages": cls("pages"),
            "year": cls("date"),
        }
        if url:
            item["url"] = url
        item = {k: v for k, v in item.items() if v}
        if item.get("title") or item.get("authors"):
            items.append(item)
    return items


def books(fragment: str) -> list[dict]:
    items = []
    for li in re.findall(r"<li[^>]*>(.*?)</li>", fragment, flags=re.S):
        t = strip_num(text(li))
        m = re.match(
            r'(?P<kind>[^,]*),\s*"(?P<title>.*?)"\s*ISBN:\s*(?P<isbn>.*?)\s*published by\s*-\s*(?P<pub>.*?)\s*Year:\s*(?P<year>\S*)\s*authors-\s*(?P<authors>.*)$',
            t,
        )
        if not m:
            if t:
                items.append({"title": t})
            continue
        d = {
            "kind": m["kind"].strip(),
            "title": m["title"].strip(),
            "isbn": m["isbn"].strip(),
            "publisher": m["pub"].strip(" ,"),
            "year": m["year"].strip(),
            "authors": m["authors"].strip(),
        }
        items.append({k: v for k, v in d.items() if v})
    return items


def table_rows(fragment: str) -> list[list[str]]:
    body = between(fragment, "<tbody>", "</tbody>")
    rows = []
    for tr in re.findall(r"<tr[^>]*>(.*?)</tr>", body, flags=re.S):
        cells = [text(c) for c in re.findall(r"<td[^>]*>(.*?)</td>", tr, flags=re.S)]
        if cells:
            rows.append(cells)
    return rows


def activity(fragment: str) -> list[dict]:
    items = []
    for block in re.split(r'<div class="p-3 shadow-sm mt-4">', fragment)[1:]:
        h = re.search(r"<h[34][^>]*>(.*?)</h[34]>", block, flags=re.S)
        title = strip_num(text(h.group(1))) if h else ""
        body = " ".join(text(p) for p in re.findall(r"<p[^>]*>(.*?)</p>", block, flags=re.S)).strip()
        img = re.search(r'<img[^>]*src="([^"]+)"', block)
        d = {"title": title, "body": body, "image": img.group(1) if img else ""}
        d = {k: v for k, v in d.items() if v and not PLACEHOLDER.match(v)}
        if d.get("title") or d.get("body"):
            items.append(d)
    return items


def extract(pid: str, s: str) -> dict:
    d: dict = {"id": pid}

    marquee = between(s, "<marquee", "</marquee>")
    d["studentAchievements"] = lis(marquee)

    img = re.search(r'<img src="([^"]+)" alt="Profile Image"', s)
    d["photo"] = img.group(1) if img else ""

    det = between(s, "profileDetails", 'class="col-md-2 profileView"')
    m = re.search(r"<h4[^>]*>(.*?)</h4>", det, flags=re.S)
    d["name"] = text(m.group(1)) if m else pid

    def field(icon):
        m = re.search(rf'<i class="fa-solid {icon} fa-fw"></i>(.*?)</span>', det, flags=re.S)
        v = text(m.group(1)) if m else ""
        return "" if PLACEHOLDER.match(v) else v

    d["designation"] = field("fa-user")
    d["address"] = field("fa-address-card")
    d["email"] = field("fa-envelope")
    d["phone"] = field("fa-square-phone")

    view = between(s, 'class="col-md-2 profileView"', "Introduction")
    m = re.search(r'<a href="([^"]*)"[^>]*>\s*<i class="fa-brands fa-google', view)
    d["scholar"] = good_url(m.group(1), pid) if m else None
    web = between(view, "Personal Website", "</ul>")
    other = between(view, "Other Links", "</ul>")
    sites = dropdown_links(web, pid)
    d["website"] = sites[0]["href"] if sites else None
    d["otherLinks"] = sites[1:] + dropdown_links(other, pid)

    intro = between(s, "Introduction", "let marqueeElement")
    intro = re.sub(r"^Introduction\s*</h4>", "", intro)
    intro = re.sub(r"<script.*", "", intro, flags=re.S)
    d["intro"] = paragraphs(intro)

    first = between(s, 'id="first"', 'id="second"')
    d["qualifications"] = merge_quals(lis(first))

    second = between(s, 'id="second"', 'id="third"')
    second = second.split("subtitle-border-bottom", 1)[-1]
    interests = lis(second)
    d["interests"] = interests_list(interests) if interests else paragraphs(re.sub(r"^[^>]*>\s*</div>\s*</div>", "", second))

    third = between(s, 'id="third"', 'id="fourth"').split("subtitle-border-bottom", 1)[-1]
    third = re.sub(r"^[^>]*>\s*</div>\s*</div>", "", third)
    d["briefProfile"] = paragraphs(third)

    def acc(target_id, nxt):
        return between(s, f'id="{target_id}" class="accordion-collapse', nxt)

    d["publications"] = {
        "journal": pubs(acc("Journal", 'data-bs-target="#Conference"')),
        "conference": pubs(acc("Conference", 'data-bs-target="#BooksC"')),
        "books": books(acc("BooksC", 'data-bs-target="#Patent"')),
        "patents": books(acc("Patent", 'data-bs-target="#PA"')),
    }
    d["affiliations"] = merge_affiliations(pid, lis(acc("PA", 'data-bs-target="#RP"')))

    rp = []
    for r in table_rows(acc("RP", 'data-bs-target="#CP"')):
        if len(r) >= 6:
            rp.append(clean({"title": r[1], "agency": r[2], "role": r[3], "period": r[4], "amount": r[5]}))
    d["researchProjects"] = rp
    cp = []
    for r in table_rows(acc("CP", 'id="fifth"')):
        if len(r) >= 5:
            cp.append(clean({"title": r[1], "agency": r[2], "period": r[3], "amount": r[4]}))
    d["consultancy"] = cp

    # Courses: legacy lists each offering (often duplicated) — group by course.
    courses: dict = {}
    for r in table_rows(between(s, 'id="courses_table1"', "</table>")):
        if len(r) < 7:
            continue
        code, title, ltpsc, ctype, degree, year, sem = r[:7]
        key = (code.upper(), title)
        c = courses.setdefault(key, {"code": code, "title": title, "ltpsc": ltpsc, "type": ctype, "degree": degree, "offerings": []})
        off = " · ".join(x for x in (year, sem) if x)
        if off and off not in c["offerings"]:
            c["offerings"].append(off)
    d["courses"] = list(courses.values())

    d["phdSupervised"] = lis(between(s, 'id="PHD"', 'data-bs-target="#Position"'))
    d["adminRoles"] = lis(between(s, 'id="Position"', "</ul>"))

    d["awards"] = activity(between(s, 'id="awards"', "<!--tab 2 end"))
    d["events"] = activity(between(s, 'id="events"', "<!--tab 3 end"))
    d["visits"] = activity(between(s, 'id="visits"', "<!--tab 4 end"))
    d["outreach"] = activity(between(s, 'id="outreach"', "<!--tab 5 end"))
    d["misc"] = activity(between(s, 'id="miscellaneous"', "<!--tab 1 end"))
    return d


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for page in sorted(SRC.iterdir()):
        body = page / "body.html"
        if not body.exists():
            continue
        data = extract(page.name, body.read_text(encoding="utf-8"))
        (OUT / f"{page.name}.json").write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        p = data["publications"]
        print(f"{page.name:16} J{len(p['journal']):>4} C{len(p['conference']):>4} B{len(p['books']):>3} P{len(p['patents']):>3} "
              f"RP{len(data['researchProjects']):>3} CP{len(data['consultancy']):>3} courses{len(data['courses']):>3}")


if __name__ == "__main__":
    main()
