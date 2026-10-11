import { SmartImage } from "@/components/site/SmartImage";
import { cn } from "@/lib/utils";

export type AboutPhoto = { type: "image"; url?: string; caption?: string; width?: "full" | "wide" | "half"; align?: "left" | "center" | "right" };
export type AboutBlock =
  | { type: "text"; text?: string; photo?: AboutPhoto }
  | AboutPhoto;

export function isAboutBlock(v: unknown): v is AboutBlock {
  return !!v && typeof v === "object" && "type" in (v as Record<string, unknown>);
}

export function parseBlocks(value: unknown): AboutBlock[] {
  if (Array.isArray(value)) return value.filter(isAboutBlock);
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter(isAboutBlock) : [];
    } catch {
      return [];
    }
  }
  return [];
}

const WIDTHS: Record<string, string> = {
  full: "w-full",
  wide: "w-full md:w-[85%]",
  half: "w-full md:w-1/2",
};

/** Renders admin-authored paragraphs with images interleaved between them. */
export function AboutBlocks({ blocks }: { blocks: AboutBlock[] }) {
  return (
    <div className="mt-10 space-y-8">
      {blocks.map((b, i) => {
        if (b.type === "text") {
          if (!b.text) return null;
          return (
            <div key={i} className="flow-root text-lg leading-relaxed text-muted-foreground">
              {b.photo?.url && (
                <figure className={cn("mb-4 w-full md:w-2/5", b.photo.align === "right" ? "md:float-right md:ml-6" : "md:float-left md:mr-6")}>
                  <SmartImage src={b.photo.url} alt={b.photo.caption ?? ""} className="h-auto w-full rounded-lg object-contain" wrapperClassName="!h-auto" />
                  {b.photo.caption && <figcaption className="mt-2 text-sm text-gold/80">{b.photo.caption}</figcaption>}
                </figure>
              )}
              {b.text.split(/\n\s*\n/).map((paragraph, j) => <p key={j} className="mb-4 last:mb-0">{paragraph}</p>)}
            </div>
          );
        }
        if (!b.url) return null;
        const align = b.align ?? "center";
        return (
          <figure
            key={i}
            className={cn(
              "flex flex-col",
              align === "center" && "items-center",
              align === "right" && "items-end",
              align === "left" && "items-start",
            )}
          >
            <div className={cn("overflow-hidden rounded-lg border border-border/60 bg-background/40", WIDTHS[b.width ?? "full"])}>
              {/* height auto → the image keeps its own natural aspect ratio */}
              <SmartImage src={b.url} alt={b.caption ?? ""} className="h-auto w-full object-contain" wrapperClassName="!h-auto" />
            </div>
            {b.caption && (
              <figcaption className="mt-2 text-xs uppercase tracking-[0.2em] text-gold/80">{b.caption}</figcaption>
            )}
          </figure>
        );
      })}
    </div>
  );
}
