/** Faculty data type + helper turning a faculty record into PersonCard-style link buttons. */
export interface Faculty {
  id: string;
  name: string;
  designation: string;
  group: string;
  groupLabel: string;
  head: boolean;
  photo: string;
  education: string[];
  interests: string[];
  /** Short tags (same as interests unless interests are prose). */
  keywords: string[];
  room: string;
  email: string;
  phone: string;
  profile: string;
  scholar: string;
  website: string;
  otherLinks: string[];
}

const KNOWN_HOSTS: [RegExp, string, string][] = [
  [/linkedin\.com/, "LinkedIn", "lucide:linkedin"],
  [/researchgate\.net/, "ResearchGate", "lucide:book-open"],
  [/ieeexplore\.ieee\.org/, "IEEE Xplore", "lucide:book-open"],
  [/vidwan\.inflibnet/, "Vidwan", "lucide:user-round"],
];

function otherLink(href: string) {
  const known = KNOWN_HOSTS.find(([re]) => re.test(href));
  if (known) return { label: known[1], href, icon: known[2] };
  let label = "Link";
  try {
    label = new URL(href).hostname.replace(/^www\./, "");
  } catch {}
  return { label, href, icon: "lucide:link" };
}

export function facultyLinks(f: Faculty) {
  return [
    f.scholar && { label: "Scholar", href: f.scholar, icon: "lucide:graduation-cap" },
    f.website && { label: "Website", href: f.website, icon: "lucide:globe" },
    ...f.otherLinks.map(otherLink),
  ].filter(Boolean) as { label: string; href: string; icon: string }[];
}
