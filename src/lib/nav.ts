// Single source of truth for site navigation (header + footer).
// Routes keep the legacy slugs (e.g. /addmissions, /committe) so links stay stable.

export type NavLink = { label: string; href: string; external?: boolean };
export type NavItem = NavLink | { label: string; children: NavLink[] };

export const mainNav: NavItem[] = [
  { label: "About", href: "/about" },
  {
    label: "People",
    children: [
      { label: "Faculty", href: "/faculty" },
      { label: "Staff", href: "/staff" },
      { label: "Students", href: "/student" },
      { label: "Alumni", href: "/alumni" },
      { label: "Website Team", href: "/team" },
    ],
  },
  {
    label: "Research",
    children: [
      { label: "Research Areas", href: "/areas" },
      { label: "Labs", href: "/lab" },
      { label: "Facilities", href: "/facilities" },
      { label: "Projects", href: "/project" },
      { label: "Publications", href: "/publications" },
    ],
  },
  {
    label: "Academics",
    children: [
      { label: "Courses", href: "/course" },
      { label: "Admissions", href: "/addmissions" },
      { label: "Committees", href: "/committe" },
    ],
  },
  {
    label: "News",
    children: [
      { label: "Latest News", href: "/news" },
      { label: "Achievements", href: "/achievements" },
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
