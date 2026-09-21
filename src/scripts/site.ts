/**
 * The only site-wide client script. Loaded once by BaseLayout.
 * Pages opt in to behaviour with data attributes — no page-specific JS.
 *
 * Theme:     [data-theme-toggle] button flips voltage <-> voltage-dark (persisted).
 * Animation: AOS — add data-aos="fade-up" (etc.) to any element.
 * Lightbox:  GLightbox — <a class="glightbox" href="big.jpg" data-gallery="g1"><img …></a>
 * Count-up:  <span data-countup="671" data-suffix="+">0</span>
 * Filtering: see initFilters() below.
 */
import AOS from "aos";
import "aos/dist/aos.css";
import GLightbox from "glightbox";
import "glightbox/dist/css/glightbox.min.css";

const THEME_KEY = "theme";

function initTheme() {
  document.querySelectorAll<HTMLElement>("[data-theme-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const next =
        document.documentElement.dataset.theme === "voltage-dark" ? "voltage" : "voltage-dark";
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {}
    });
  });
}

/**
 * Attribute-driven list filtering (search box + group tabs), reusable on any page:
 *
 * <div data-filter-root>
 *   <input data-filter-search placeholder="Search…" />
 *   <button data-filter-group="all" class="btn-active">All</button>
 *   <button data-filter-group="power">Power</button>
 *   <select data-filter-select="batch"><option value="all">All</option><option value="2023">2023</option></select>
 *   <article data-filter-item data-text="name area email" data-group="power" data-batch="2023">…</article>
 *   <p data-filter-empty hidden>No results</p>
 *   <span data-filter-count></span>
 * </div>
 *
 * - data-text: text matched by the search box (defaults to the item's textContent).
 * - data-group: space-separated groups; a group button with value "all" shows everything.
 * - data-filter-select="<key>" matches the item's data-<key> attribute ("all" = no filter).
 * - Active group button gets the class in data-active-class (default "btn-active").
 * - Items can be nested anywhere inside the root (tables rows, grids, …).
 */
function initFilters() {
  document.querySelectorAll<HTMLElement>("[data-filter-root]").forEach((root) => {
    const search = root.querySelector<HTMLInputElement>("[data-filter-search]");
    const groupBtns = [...root.querySelectorAll<HTMLElement>("[data-filter-group]")];
    const selects = [...root.querySelectorAll<HTMLSelectElement>("[data-filter-select]")];
    const items = [...root.querySelectorAll<HTMLElement>("[data-filter-item]")];
    const empty = root.querySelector<HTMLElement>("[data-filter-empty]");
    const count = root.querySelector<HTMLElement>("[data-filter-count]");
    const activeClass = root.dataset.activeClass ?? "btn-active";
    let group =
      groupBtns.find((b) => b.classList.contains(activeClass))?.dataset.filterGroup ?? "all";

    const apply = () => {
      const q = (search?.value ?? "").trim().toLowerCase();
      let shown = 0;
      for (const item of items) {
        const text = (item.dataset.text ?? item.textContent ?? "").toLowerCase();
        const groups = (item.dataset.group ?? "").split(/\s+/);
        const okSearch = !q || text.includes(q);
        const okGroup = group === "all" || groups.includes(group);
        const okSelects = selects.every((s) => {
          const key = s.dataset.filterSelect!;
          return s.value === "all" || item.dataset[key] === s.value;
        });
        const show = okSearch && okGroup && okSelects;
        item.hidden = !show;
        if (show) shown++;
      }
      if (empty) empty.hidden = shown > 0;
      if (count) count.textContent = String(shown);
    };

    search?.addEventListener("input", apply);
    selects.forEach((s) => s.addEventListener("change", apply));
    groupBtns.forEach((btn) =>
      btn.addEventListener("click", () => {
        group = btn.dataset.filterGroup ?? "all";
        groupBtns.forEach((b) => b.classList.toggle(activeClass, b === btn));
        apply();
      }),
    );
    apply();
  });
}

function initCountUp() {
  const els = document.querySelectorAll<HTMLElement>("[data-countup]");
  if (!els.length) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const run = (el: HTMLElement) => {
    const target = Number(el.dataset.countup);
    const suffix = el.dataset.suffix ?? "";
    if (reduce || !Number.isFinite(target)) {
      el.textContent = `${el.dataset.countup}${suffix}`;
      return;
    }
    const start = performance.now();
    const dur = 1400;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      el.textContent = `${Math.round(target * (1 - Math.pow(1 - p, 3)))}${suffix}`;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        run(e.target as HTMLElement);
        io.unobserve(e.target);
      }
    }
  });
  els.forEach((el) => io.observe(el));
}

function initNavbarScroll() {
  const nav = document.querySelector<HTMLElement>("[data-site-header]");
  if (!nav) return;
  const onScroll = () => nav.toggleAttribute("data-scrolled", window.scrollY > 8);
  onScroll();
  addEventListener("scroll", onScroll, { passive: true });
}

initTheme();
initNavbarScroll();
initFilters();
initCountUp();
AOS.init({ once: true, duration: 600, easing: "ease-out-cubic", offset: 40 });
if (document.querySelector(".glightbox")) GLightbox({ selector: ".glightbox" });
