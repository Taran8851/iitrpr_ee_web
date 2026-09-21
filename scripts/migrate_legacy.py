"""
One-off migration: legacy-site/ (wget mirror) -> Astro sources.

  - base64 data-URI images  -> public/images/legacy/<hash>.<ext>
  - legacy css/ scripts/ assets/ -> public/ (root-absolute paths)
  - *.php.html / profile links -> clean routes (/about, /people/<user>)
  - shared header/footer      -> src/legacy/partials/{header,footer}.html
  - per page                  -> src/legacy/pages/<slug>/{head,body,tail}.html

The header partial is hand-edited afterwards (theme switcher + auto-logout
banner removed), so re-running this script requires redoing those edits.

Re-runnable: wipes its own outputs first. Usage: python3 scripts/migrate_legacy.py
"""

import base64
import hashlib
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "legacy-site"
PUBLIC = ROOT / "public"
IMG_DIR = PUBLIC / "images" / "legacy"
OUT = ROOT / "src" / "legacy"

SKIP = {"chart.custom.js.html"}  # wget mis-fetch of a JS file, not a page
PROFILE_RE = re.compile(r"profile\.faculty\.php(?:%3F|\?)mail=([^@%\"'#]+)(?:@|%40)iitrpr\.ac\.in\.html")
DATA_URI_RE = re.compile(r"data:image/[a-zA-Z0-9.+-]+;base64,([A-Za-z0-9+/=]{200,})")
# Header include ends with the auto-logout timer banner + its <script>; the
# "<!-- Navbar End -->" comment is missing on some pages, so anchor on that.
HEADER_END_RE = re.compile(r'id="timer1".*?</script>(?:\s*<!--\s*Navbar End(?:ed)?\s*-->)?', re.S)


def slug_for(name: str) -> str:
    if name == "index.html":
        return "index"
    m = PROFILE_RE.fullmatch(name.replace("?", "%3F"))
    if m:
        return f"people/{m.group(1)}"
    return name.removesuffix(".php.html")


def route_for(slug: str) -> str:
    return "/" if slug == "index" else f"/{slug}"


def sniff_ext(data: bytes) -> str:
    if data.startswith(b"\x89PNG"):
        return "png"
    if data.startswith(b"\xff\xd8"):
        return "jpg"
    if data[:6] in (b"GIF87a", b"GIF89a"):
        return "gif"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "webp"
    return "bin"


def extract_images(text: str, stats: dict) -> str:
    def repl(m):
        data = base64.b64decode(m.group(1) + "=" * (-len(m.group(1)) % 4))
        name = f"{hashlib.sha1(data).hexdigest()[:12]}.{sniff_ext(data)}"
        path = IMG_DIR / name
        if not path.exists():
            path.write_bytes(data)
            stats["images"] += 1
        return f"/images/legacy/{name}"

    return DATA_URI_RE.sub(repl, text)


def rewrite_links(text: str) -> str:
    q = r"""(?<=["'(])"""  # only inside attribute values / url()
    text = re.sub(q + r"(?:\./)?(assets|css|scripts)/", r"/\1/", text)
    text = re.sub(q + PROFILE_RE.pattern, lambda m: f"/people/{m.group(1)}", text)
    text = re.sub(q + r"index\.html", "/", text)
    text = re.sub(q + r"([a-z_.-]+)\.php\.html", r"/\1", text)
    return text


def fix_self_links(text: str, route: str) -> str:
    # wget turned every href="#..." into href="<this page>#..."
    return re.sub(r'href="' + re.escape(route) + r"#", 'href="#', text)


def split_page(text: str):
    head = re.search(r"<head>(.*?)</head>", text, re.S).group(1)
    body = re.search(r"<body[^>]*>(.*)</body>", text, re.S).group(1)
    header_end = HEADER_END_RE.search(body)
    footer = re.search(r"<footer.*?</footer>", body, re.S)
    header = body[: header_end.end()]
    content = body[header_end.end() : footer.start()]
    tail = body[footer.end() :]
    content = re.sub(r"<!--\s*Footer Start(?:ed)?\s*-->\s*$", "", content.rstrip())
    tail = re.sub(r"^\s*<!--\s*Footer End(?:ed)?\s*-->", "", tail)
    return head.strip(), header, content, footer.group(0), tail


def main():
    for d in (OUT, IMG_DIR, *(PUBLIC / d for d in ("assets", "css", "scripts"))):
        shutil.rmtree(d, ignore_errors=True)
    IMG_DIR.mkdir(parents=True)
    (OUT / "partials").mkdir(parents=True)

    for d in ("assets", "css", "scripts"):
        shutil.copytree(SRC / d, PUBLIC / d)
    shutil.copy(SRC / "assets" / "logo_0_1.png", PUBLIC / "favicon.png")

    stats = {"images": 0, "pages": 0}
    for css in (PUBLIC / "css").glob("*.css"):
        css.write_text(extract_images(css.read_text(), stats))

    for f in sorted(SRC.glob("*.html")):
        if f.name in SKIP:
            continue
        slug = slug_for(f.name)
        route = route_for(slug)
        text = f.read_text(encoding="utf-8", errors="replace")
        text = extract_images(text, stats)
        text = rewrite_links(text)
        text = fix_self_links(text, route)
        head, header, content, footer, tail = split_page(text)

        if slug == "index":  # header/footer are identical on every page
            (OUT / "partials" / "header.html").write_text(header)
            (OUT / "partials" / "footer.html").write_text(footer)

        page_dir = OUT / "pages" / slug
        page_dir.mkdir(parents=True, exist_ok=True)
        (page_dir / "head.html").write_text(head + "\n")
        (page_dir / "body.html").write_text(content.strip() + "\n")
        (page_dir / "tail.html").write_text(tail.strip() + "\n")  # scripts that run after the footer
        stats["pages"] += 1

    print(f"pages: {stats['pages']}, images extracted: {stats['images']}")


if __name__ == "__main__":
    main()
