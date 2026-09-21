// Single source of truth for site navigation (header + footer).
// Routes keep the legacy slugs (e.g. /addmissions, /committe) so links stay stable.

export type NavLink = { label: string; href: string; external?: boolean; desc?: string; icon?: string };
export type NavItem = NavLink | { label: string; children: NavLink[] };

export const mainNav: NavItem[] = [
  { label: "About", href: "/about" },
  {
    label: "People",
    children: [
      { label: "Faculty", href: "/faculty", icon: "lucide:graduation-cap", desc: "Professors, research interests & profiles" },
      { label: "Staff", href: "/staff", icon: "lucide:briefcase", desc: "Technical & administrative team" },
      { label: "Students", href: "/student", icon: "lucide:users", desc: "M.Tech & Ph.D. scholars" },
      { label: "Alumni", href: "/alumni", icon: "lucide:award", desc: "Graduates of the department" },
      { label: "Website Team", href: "/team", icon: "lucide:code-2", desc: "People who build this site" },
    ],
  },
  {
    label: "Research",
    children: [
      { label: "Research Areas", href: "/areas", icon: "lucide:zap", desc: "Power, VLSI, signal processing & more" },
      { label: "Labs", href: "/lab", icon: "lucide:flask-conical", desc: "27 teaching & research labs" },
      { label: "Facilities", href: "/facilities", icon: "lucide:cpu", desc: "Research facilities & lab websites" },
      { label: "Projects", href: "/project", icon: "lucide:folder-kanban", desc: "Sponsored research projects" },
      { label: "Publications", href: "/publications", icon: "lucide:book-open", desc: "Journals, conferences & patents" },
    ],
  },
  {
    label: "Academics",
    children: [
      { label: "Courses", href: "/course", icon: "lucide:library", desc: "B.Tech & M.Tech course catalogue" },
      { label: "Admissions", href: "/addmissions", icon: "lucide:door-open", desc: "How to join our programmes" },
      { label: "Committees", href: "/committe", icon: "lucide:clipboard-list", desc: "Faculty advisors & committees" },
    ],
  },
  {
    label: "News",
    children: [
      { label: "Latest News", href: "/news", icon: "lucide:newspaper", desc: "Announcements & events" },
      { label: "Achievements", href: "/achievements", icon: "lucide:trophy", desc: "Awards & recognitions" },
    ],
  },
  { label: "Placements", href: "/placements.graphs" },
  { label: "Contact", href: "/contact" },
];

export const contact = {
  name: "Department of Electrical Engineering",
  institute: "Indian Institute of Technology Ropar",
  address: "Rupnagar, Punjab 140001, India",
  email: "eeoffice@iitrpr.ac.in",
  phone: "+91-1881-232202",
  mapUrl: "https://www.google.com/maps/search/?api=1&query=Indian+Institute+of+Technology+Ropar",
};

export const footerColumns: { title: string; links: NavLink[] }[] = [
  {
    title: "Quick Links",
    links: [
      { label: "IIT Ropar", href: "https://www.iitrpr.ac.in/", external: true },
      { label: "Classroom Booking", href: "http://117.252.3.39/index.php", external: true },
      { label: "Download Forms", href: "http://www.iitrpr.ac.in/downloads/forms.html", external: true },
      { label: "How to Reach", href: contact.mapUrl, external: true },
      { label: "Screen Reader Access", href: "/screen-reader-access" },
    ],
  },
  {
    title: "Opportunities",
    links: [
      { label: "Faculty Positions", href: "http://www.iitrpr.ac.in/jobs/faculty-positions", external: true },
      { label: "Ph.D. Admissions", href: "http://www.iitrpr.ac.in/how-apply", external: true },
      { label: "Project Positions", href: "http://www.iitrpr.ac.in/jobs/project-positions", external: true },
      { label: "Post-Doctoral Fellowship", href: "http://www.iitrpr.ac.in/institute-post-doctoral-fellowship", external: true },
    ],
  },
  {
    title: "Institute",
    links: [
      { label: "Deans", href: "http://www.iitrpr.ac.in/deans", external: true },
      { label: "Associate Deans", href: "http://www.iitrpr.ac.in/associate-deans", external: true },
      { label: "Heads of Departments", href: "http://www.iitrpr.ac.in/head-departments", external: true },
      { label: "Administrative Officials", href: "http://www.iitrpr.ac.in/administrative-officials", external: true },
    ],
  },
];
