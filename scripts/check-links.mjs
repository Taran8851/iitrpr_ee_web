// Verifies every root-relative href/src/url() in dist/**/*.html points to an existing file.
// Usage: npm run build && npm run check:links
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const DIST = "dist";
const files = [];
const walk = (d) => readdirSync(d).forEach((f) => {
  const p = join(d, f);
  statSync(p).isDirectory() ? walk(p) : p.endsWith(".html") && files.push(p);
});
walk(DIST);

const re = /(?:href|src)="(\/[^"#?]*)|url\(['"]?(\/[^'")?#]*)/g;
const missing = new Map();
for (const f of files) {
  for (const m of readFileSync(f, "utf8").replace(/<!--[\s\S]*?-->/g, "").matchAll(re)) {
    const url = decodeURIComponent(m[1] ?? m[2]);
    if (url.startsWith("//")) continue;
    const p = join(DIST, url);
    if (url === "/" || existsSync(p) || existsSync(join(p, "index.html"))) continue;
    if (!missing.has(url)) missing.set(url, f);
  }
}
for (const [url, f] of missing) console.error(`MISSING ${url}  (first seen in ${f})`);
console.log(`${files.length} pages checked, ${missing.size} missing link(s).`);
process.exit(missing.size ? 1 : 0);
