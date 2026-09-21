import areas from "../../data/research/areas.json";

export type DomainKey = "power" | "spc" | "vlsi";

/** Solid icon chip per domain — theme tokens keep AA contrast in light and dark. */
export const domainChip: Record<DomainKey, string> = {
  power: "bg-primary text-primary-content",
  spc: "bg-secondary text-secondary-content",
  vlsi: "bg-accent text-accent-content",
};

export const domains = areas.domains as (typeof areas.domains[number] & { key: DomainKey })[];

export const domainByKey = Object.fromEntries(domains.map((d) => [d.key, d])) as Record<
  DomainKey,
  (typeof domains)[number]
>;
