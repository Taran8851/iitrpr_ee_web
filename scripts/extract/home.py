"""Extract home-page content (hero images, notifications, achievements, news)
from the legacy index body into src/data/home/*.json.

The legacy dir src/legacy/pages/index/ has been deleted after extraction; to re-run,
restore it from git (e.g. `git show e3b7200:src/legacy/pages/index/body.html > /tmp/body.html`)
and pass the path: python3 scripts/extract/home.py /tmp/body.html
"""
import html
import json
import re
import sys
import unicodedata
from pathlib import Path

SRC = Path(sys.argv[1] if len(sys.argv) > 1 else "src/legacy/pages/index/body.html")
OUT = Path("src/data/home")
OUT.mkdir(parents=True, exist_ok=True)
b = SRC.read_text(encoding="utf-8")


def clean(s: str) -> str:
    s = re.sub(r"<[^>]+>", "", s)
    s = html.unescape(s).replace("\\'", "'")
    # Mathematical bold letters (e.g. "𝗣𝗼𝘄𝗲𝗿") -> plain text for readability / screen readers
    s = unicodedata.normalize("NFKC", s)
    s = re.sub(r"\s+", " ", s).strip()
    s = re.sub(r"\.\.+$", ".", s)
    return s


hero = re.findall(r"banner_container' style='background-image: url\(([^)]+)\)", b)

notif_block = b[b.index("__notification_panel"): b.index("</marquee>")]
notifications = [clean(x) for x in re.findall(r"<li>(.*?)</li>", notif_block, re.S)]

ach_block = b[b.index("Achievements</span>"): b.index('href="/achievements"')]
achievements = []
for names, rest in re.findall(
    r"<span style='font-weight: bold;'>(.*?)</span>,(.*?)(?=<p>|</p>|<div)", ach_block, re.S
):
    rest = clean(rest)
    m = re.match(r"Research Scholar, under the supervision of ([^,]+), (.*)", rest)
    sup, text = (m.group(1).strip(), m.group(2)) if m else ("", rest)
    achievements.append({"names": clean(names), "supervisor": sup, "text": text})

news = []
for img, date, title, body in re.findall(
    r'<img src="([^"]+)"[^>]*>.*?media-date">0?(\d{4}-\d{2}-\d{2})</span>.*?<h5[^>]*>(.*?)</h5>.*?<p[^>]*>(.*?)</p>',
    b[b.index("mySwiper1"):],
    re.S,
):
    news.append({"image": img, "date": date, "title": clean(title), "body": clean(body)})
news.sort(key=lambda n: n["date"], reverse=True)

m = re.search(r"var startYear = (\d{4})", b)
meta = {"startYear": int(m.group(1))}

for name, data in [
    ("hero", hero),
    ("notifications", notifications),
    ("achievements", achievements),
    ("news", news),
    ("meta", meta),
]:
    (OUT / f"{name}.json").write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(name, len(data))
