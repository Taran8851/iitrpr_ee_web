/**
 * GET /api/research-graph.json — static (built at `astro build`) research graph.
 *
 * Sources merged here:
 *   - src/data/research-output/publications.json   (website publications, from faculty profiles)
 *   - src/data/graph/scholar-papers.json            (optional; written by scripts/scholar/sync_scholar.py)
 *   - src/data/faculty/faculty.json, src/data/graph/topics.json
 *
 * Contract: ResearchGraphData in src/lib/research-graph.ts, documented in docs/research-graph-api.md.
 * A live backend can serve the same shape; set PUBLIC_RESEARCH_GRAPH_URL to use it instead.
 */
import type { APIRoute } from "astro";
import facultyData from "../../data/faculty/faculty.json";
import topicsData from "../../data/graph/topics.json";
import publications from "../../data/research-output/publications.json";
import {
  GRAPH_SCHEMA_VERSION,
  ensureTopics,
  scholarIdFrom,
  slugTitle,
  type GraphPaper,
  type ResearchGraphData,
} from "../../lib/research-graph";

// Optional Scholar dump — absent until the sync script has been run.
const scholarFiles = import.meta.glob<{ default: GraphPaper[] }>("../../data/graph/scholar-papers.json", {
  eager: true,
});
const scholarPapers: GraphPaper[] = Object.values(scholarFiles)[0]?.default ?? [];

export const GET: APIRoute = () => {
  const faculty = facultyData.map((f) => ({
    id: f.id,
    name: f.name,
    designation: f.designation,
    group: f.group,
    groupLabel: f.groupLabel,
    photo: f.photo || undefined,
    profile: f.profile || `/people/${f.id}`,
    scholarId: scholarIdFrom(f.scholar),
  }));
  const known = new Set(faculty.map((f) => f.id));

  // Merge website + Scholar papers, de-duplicated by normalised title.
  const byTitle = new Map<string, GraphPaper>();
  const add = (p: GraphPaper, source: string) => {
    const key = slugTitle(p.title);
    if (!key) return;
    const ids = p.faculty.filter((id) => known.has(id));
    if (!ids.length) return;
    const existing = byTitle.get(key);
    if (existing) {
      existing.faculty = [...new Set([...existing.faculty, ...ids])];
      existing.citations ??= p.citations ?? null;
      existing.link ??= p.link ?? null;
      return;
    }
    byTitle.set(key, { ...p, id: `p${byTitle.size + 1}`, faculty: ids, source: p.source ?? source });
  };
  for (const p of publications.items as GraphPaper[]) add(p, "website");
  for (const p of scholarPapers) add(p, "scholar");

  const data: ResearchGraphData = ensureTopics({
    version: GRAPH_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    source: scholarPapers.length ? "website+scholar" : "website",
    faculty,
    topics: topicsData,
    papers: [...byTitle.values()].map(({ id, title, year, type, venue, authors, link, citations, faculty, topics, source }) => ({
      id, title, year, type, venue, authors, link, citations, faculty, topics, source,
    })),
  });

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};
