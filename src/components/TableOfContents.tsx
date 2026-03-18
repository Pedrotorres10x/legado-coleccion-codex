import { useEffect, useRef, useState } from "react";
import { ChevronDown, List } from "lucide-react";

export type TocHeading = {
  id: string;
  text: string;
  level: number; // 2 or 3
};

interface TableOfContentsProps {
  headings: TocHeading[];
  /** Show as mobile collapsible (default false = sidebar mode) */
  mobile?: boolean;
}

const TableOfContents = ({ headings, mobile = false }: TableOfContentsProps) => {
  const [activeId, setActiveId] = useState<string>("");
  const [open, setOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Track active heading via IntersectionObserver
  useEffect(() => {
    if (headings.length === 0) return;

    const headingEls = headings
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Find the topmost visible heading
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-80px 0px -60% 0px",
        threshold: 0,
      }
    );

    headingEls.forEach((el) => observerRef.current!.observe(el));

    return () => observerRef.current?.disconnect();
  }, [headings]);

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 100; // navbar height
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
    setActiveId(id);
    if (mobile) setOpen(false);
  };

  const progress = activeId
    ? Math.round(
        ((headings.findIndex((h) => h.id === activeId) + 1) / headings.length) * 100
      )
    : 0;

  if (headings.length < 2) return null;

  // ── Mobile: collapsible card ──────────────────────────────────────────────
  if (mobile) {
    return (
      <div className="xl:hidden mb-10 rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden">
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-foreground"
          aria-expanded={open}
        >
          <span className="flex items-center gap-2">
            <List className="w-4 h-4 text-primary" />
            Tabla de contenidos
          </span>
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          />
        </button>

          {open && (
            <nav
              aria-label="Tabla de contenidos"
              className="overflow-hidden border-t border-border/30 enter-fade-up"
            >
              <ol className="px-5 py-4 space-y-1">
                {headings.map((h) => (
                  <li key={h.id} className={h.level === 3 ? "pl-4" : ""}>
                    <button
                      onClick={() => handleClick(h.id)}
                      className={`w-full text-left text-sm py-1.5 transition-colors duration-200 leading-snug ${
                        activeId === h.id
                          ? "text-primary font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {h.level === 3 && (
                        <span className="inline-block w-1 h-1 rounded-full bg-current mr-2 mb-0.5 align-middle opacity-50" />
                      )}
                      {h.text}
                    </button>
                  </li>
                ))}
              </ol>
            </nav>
          )}
      </div>
    );
  }

  // ── Desktop: sticky sidebar ───────────────────────────────────────────────
  return (
    <aside
      className="hidden xl:block w-64 flex-shrink-0 enter-fade-up"
      aria-label="Tabla de contenidos"
    >
      <div className="sticky top-28">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <List className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground">
            Contenidos
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-0.5 bg-border/40 rounded-full mb-5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Heading list */}
        <nav>
          <ol className="space-y-0.5">
            {headings.map((h, i) => {
              const isActive = activeId === h.id;
              return (
                <li key={h.id} className={h.level === 3 ? "pl-3" : ""}>
                  <button
                    onClick={() => handleClick(h.id)}
                    className={`group w-full text-left relative flex items-start gap-2.5 py-1.5 pr-2 transition-all duration-200 ${
                      isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {/* Active indicator line */}
                    <span
                      className={`mt-[7px] flex-shrink-0 rounded-full transition-all duration-300 ${
                        h.level === 2 ? "w-1 h-1" : "w-0.5 h-0.5"
                      } ${isActive ? "bg-primary scale-150" : "bg-muted-foreground/40 group-hover:bg-muted-foreground"}`}
                    />
                    <span
                      className={`leading-snug transition-all duration-200 ${
                        h.level === 2 ? "text-[13px] font-medium" : "text-[12px]"
                      } ${isActive ? "font-semibold" : ""}`}
                    >
                      {h.text}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Decorative bottom */}
        <div className="mt-6 pt-4 border-t border-border/30">
          <p className="text-[11px] text-muted-foreground/50 tracking-wider uppercase">
            {Math.max(0, headings.findIndex((h) => h.id === activeId) + 1)} / {headings.length} secciones
          </p>
        </div>
      </div>
    </aside>
  );
};

export default TableOfContents;

// ── Utility: slugify + inject heading IDs into HTML ───────────────────────

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

export function processArticleContent(html: string): {
  processedHtml: string;
  headings: TocHeading[];
} {
  const headings: TocHeading[] = [];
  const usedIds = new Set<string>();

  const processedHtml = html.replace(
    /<(h[23])([^>]*)>([\s\S]*?)<\/h[23]>/gi,
    (match, tag: string, attrs: string, inner: string) => {
      const text = inner.replace(/<[^>]*>/g, "").trim();
      if (!text) return match;

      let id = slugifyHeading(text);
      // Ensure unique IDs
      if (usedIds.has(id)) {
        let n = 2;
        while (usedIds.has(`${id}-${n}`)) n++;
        id = `${id}-${n}`;
      }
      usedIds.add(id);

      const level = parseInt(tag[1], 10); // 2 or 3
      headings.push({ id, text, level });

      // Preserve existing attributes, inject id
      const cleanAttrs = attrs.replace(/\sid="[^"]*"/gi, "");
      return `<${tag}${cleanAttrs} id="${id}">${inner}</${tag}>`;
    }
  );

  return { processedHtml, headings };
}
