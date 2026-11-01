import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, ChevronLeft, ChevronRight, Clapperboard, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCollection, type ContentItem } from "@/lib/cms";

function HighlightPhoto({ item }: { item: ContentItem }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="relative flex shrink-0 items-center justify-center overflow-hidden border-b border-border/60 bg-muted">
      {item.image_url && !failed ? (
        <img src={item.image_url} alt={item.title} loading="lazy" decoding="async" onError={() => setFailed(true)} className="block h-auto w-full" />
      ) : (
        <span className="p-8 text-center font-serif text-xl text-muted-foreground">{item.title}</span>
      )}
    </div>
  );
}

function Highlight({ items, category, href, label, icon: Icon }: {
  items: ContentItem[];
  category: string;
  href: "/scripts" | "/books" | "/blog";
  label: string;
  icon: typeof BookOpen;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const index = Math.max(0, items.findIndex((item) => item.id === selectedId));
  const item = items[index];
  if (!item) return null;
  const text = (item.body || item.subtitle || "").trim();
  const excerpt = text.length > 240 ? text.slice(0, 240).replace(/\s+\S*$/, "") + "…" : text;
  const move = (direction: number) => setSelectedId(items[(index + direction + items.length) % items.length]?.id ?? null);

  return (
    <article aria-label={`${category} highlight`} className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-border/60 bg-card">
      <HighlightPhoto key={`${item.id}-${item.image_url}`} item={item} />
      <div className="flex flex-1 flex-col p-6">
        <p className="flex items-center gap-2 font-accent text-xs uppercase text-gold"><Icon className="h-4 w-4" />{category}</p>
        <h3 className="mt-4 break-words font-serif text-2xl text-foreground">{item.title}</h3>
        {excerpt && <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">{excerpt}</p>}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-6">
          <Button asChild variant="link" className="h-auto whitespace-normal p-0 text-left">
            {href === "/scripts" ? (
              <Link to="/scripts/$id" params={{ id: item.slug || item.id }}>{label}<ArrowRight /></Link>
            ) : (
              <Link to={href} hash={href === "/blog" ? item.slug ?? item.id : undefined}>{label}<ArrowRight /></Link>
            )}
          </Button>
          {items.length > 1 && <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => move(-1)} aria-label={`Previous ${category.toLowerCase()} highlight`} title={`Previous ${category.toLowerCase()} highlight`}><ChevronLeft /></Button>
            <span className="text-xs tabular-nums text-muted-foreground">{index + 1}/{items.length}</span>
            <Button variant="ghost" size="icon" onClick={() => move(1)} aria-label={`Next ${category.toLowerCase()} highlight`} title={`Next ${category.toLowerCase()} highlight`}><ChevronRight /></Button>
          </div>}
        </div>
      </div>
    </article>
  );
}

export function ArchiveHighlights({ books, scripts, blogs }: { books: ContentItem[]; scripts: ContentItem[]; blogs: ContentItem[] }) {
  const { data: bookItems = [] } = useCollection("book", { initialData: books, refetchInterval: 60_000 });
  const { data: scriptItems = [] } = useCollection("script", { initialData: scripts, refetchInterval: 60_000 });
  const { data: blogItems = [] } = useCollection("blog", { initialData: blogs, refetchInterval: 60_000 });
  if (!bookItems.length && !scriptItems.length && !blogItems.length) return null;
  return (
    <section aria-labelledby="archive-highlights-title" className="border-t border-border/40 bg-background py-20">
      <div className="mx-auto max-w-6xl px-6">
        <p className="font-accent text-xs uppercase text-gold">My Archive</p>
        <h2 id="archive-highlights-title" className="mt-3 font-serif text-4xl text-foreground md:text-5xl">From the Written Pages</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <Highlight items={scriptItems} category="Screenplays" href="/scripts" label="Read synopsis" icon={Clapperboard} />
          <Highlight items={bookItems} category="Books" href="/books" label="Read more" icon={BookOpen} />
          <Highlight items={blogItems} category="Blog" href="/blog" label="Read more" icon={PenLine} />
        </div>
      </div>
    </section>
  );
}