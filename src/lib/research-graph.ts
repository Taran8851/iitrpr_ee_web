/**
 * Research graph — data contract + helpers shared by the build-time endpoint
 * (src/pages/api/research-graph.json.ts) and the browser (ResearchGraph.astro).
 *
 * A backend can serve the SAME shape (e.g. papers pulled from Google Scholar) and the
 * page will use it when PUBLIC_RESEARCH_GRAPH_URL is set. See docs/research-graph-api.md.
 */

export const GRAPH_SCHEMA_VERSION = 1;

export interface GraphFaculty {
  id: string; // matches /people/<id>
  name: string;
  designation?: string;
  group?: string; // "power" | "vlsi" | "spc" | ...
  groupLabel?: string;
  photo?: string;
  profile?: string; // URL of profile page
  scholarId?: string; // Google Scholar `user=` id
}

export interface GraphTopic {
  id: string;
  label: string;
  domain: string; // "power" | "spc" | "vlsi"
  /** Title/venue keywords used to auto-tag papers that arrive without `topics`. */
  keywords?: string[];
}

export interface GraphPaper {
  id: string;
  title: string;
  year?: number | null;
  type?: string; // Journal | Conference | Patent | Book/Chapter
  venue?: string | null;
  authors?: string | null;
  link?: string | null;
  citations?: number | null;
  faculty: string[]; // GraphFaculty ids
  topics?: string[]; // GraphTopic ids — optional; auto-tagged from keywords if missing
  source?: string; // "website" | "scholar" | ...
}

export interface ResearchGraphData {
  version: number;
  generatedAt: string;
  source: string;
  faculty: GraphFaculty[];
  topics: GraphTopic[];
  papers: GraphPaper[];
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Keyword → RegExp: word-start boundary always, word-end boundary for short tokens (≤4 chars). */
export function topicMatchers(topics: GraphTopic[]) {
  return topics.map((t) => {
    const parts = (t.keywords ?? []).map((k) => {
      const kw = escape(k.trim().toLowerCase());
      return k.trim().length <= 4 ? `${kw}(?![a-z0-9])` : kw;
    });
    return { id: t.id, re: parts.length ? new RegExp(`(?:^|[^a-z0-9])(?:${parts.join("|")})`, "i") : null };
  });
}

export function classify(text: string, matchers: ReturnType<typeof topicMatchers>): string[] {
  return matchers.filter((m) => m.re?.test(text)).map((m) => m.id);
}

/** Fill in missing paper.topics from keywords (idempotent). */
export function ensureTopics(data: ResearchGraphData): ResearchGraphData {
  const matchers = topicMatchers(data.topics);
  for (const p of data.papers) {
    if (!p.topics || p.topics.length === 0) p.topics = classify(`${p.title} ${p.venue ?? ""}`, matchers);
  }
  return data;
}

export const slugTitle = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().slice(0, 120);

/** Scholar `user=` id from a profile URL. */
export const scholarIdFrom = (url?: string) => url?.match(/[?&]user=([\w-]+)/)?.[1];
