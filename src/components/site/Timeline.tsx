import { SmartImage } from "@/components/site/SmartImage";
import { ExpandableText } from "@/components/site/ExpandableText";
import type { ContentItem } from "@/lib/cms";

function yearRank(year: string) {
  const n = Number(String(year).replace(/[^0-9]/g, "").slice(0, 4));
  return Number.isFinite(n) && n > 0 ? n : Number.POSITIVE_INFINITY; // "Future" and blanks last
}

export function Timeline({ items }: { items: ContentItem[] }) {
  const sorted = [...items].sort((a, b) => {
    const ay = yearRank(String((a.meta as { year?: string })?.year ?? ""));
    const by = yearRank(String((b.meta as { year?: string })?.year ?? ""));
    if (ay !== by) return ay - by;
    return a.sort_order - b.sort_order;
  });

  return (
    <ol className="relative ml-3 border-l border-gold/30 pl-8 md:ml-6 md:pl-12">
      {sorted.map((a) => {
        const meta = (a.meta ?? {}) as { year?: string; location?: string; url?: string };
        return (
          <li key={a.id} className="relative pb-12 last:pb-0">
            <span
              aria-hidden
              className="absolute -left-[41px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-gold/60 bg-background md:-left-[57px]"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            </span>

            {meta.year && (
              <p className="font-accent text-sm uppercase tracking-[0.3em] text-gold">{meta.year}</p>
            )}
            <h3 className="mt-2 font-serif text-2xl text-foreground">{a.title}</h3>
            {(a.subtitle || meta.location) && (
              <p className="mt-1 text-sm text-muted-foreground">
                {[a.subtitle, meta.location].filter(Boolean).join(" · ")}
              </p>
            )}
            {a.body && (
              <ExpandableText text={a.body} threshold={260} className="mt-3 max-w-2xl text-sm text-muted-foreground" />
            )}

            {a.image_url && (
              <div className="mt-5 max-w-md overflow-hidden rounded-lg border border-border/60 bg-background/40">
                <SmartImage src={a.image_url} alt={a.title} className="h-auto w-full object-contain" />
              </div>
            )}

            {meta.url && (
              <a
                href={meta.url}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block text-xs font-medium uppercase tracking-widest text-gold hover:opacity-80"
              >
                Learn more
              </a>
            )}
          </li>
        );
      })}
    </ol>
  );
}
