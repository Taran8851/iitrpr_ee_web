/** Category labels + Lucide icons shared by the news and achievements pages. */
export const categories: Record<string, { label: string; icon: string }> = {
  award: { label: "Award", icon: "lucide:trophy" },
  paper: { label: "Paper Award", icon: "lucide:file-badge" },
  patent: { label: "Patent", icon: "lucide:lightbulb" },
  phd: { label: "PhD Defense", icon: "lucide:graduation-cap" },
  competition: { label: "Competition", icon: "lucide:medal" },
  "travel-grant": { label: "Travel Grant", icon: "lucide:plane" },
  career: { label: "Career", icon: "lucide:briefcase" },
};

export const category = (key: string) => categories[key] ?? { label: key, icon: "lucide:award" };
