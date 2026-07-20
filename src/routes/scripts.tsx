import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useSection, useCollection, type ContentItem } from "@/lib/cms";
import { SmartImage } from "@/components/site/SmartImage";

type Header = { title: string; body: string };

function makePage(collection: string, page: string) {
  return function Page() {
    const { data: header } = useSection<Header>(page, "header");
    const { data: items } = useCollection(collection);
    const h = header?.content;
    return (
      <SiteLayout>
        <section className="mx-auto max-w-6xl px-6 py-24">
          <div className="max-w-2xl">
            <h1 className="font-serif text-5xl text-cream">{h?.title}</h1>
            <p className="mt-4 text-muted-foreground">{h?.body}</p>
          </div>
          <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items?.map((it: ContentItem) => (
              <article key={it.id} className="overflow-hidden rounded-xl border border-border/60 bg-card/60 backdrop-blur">
                {it.image_url && (
                  <div className="flex min-h-[14rem] items-center justify-center overflow-hidden bg-background/60 p-2">
                    <SmartImage
                      src={it.image_url}
                      alt={it.title}
                      loading="lazy"
                      fallbackLabel={it.title}
                      className="max-h-[28rem] w-auto max-w-full object-contain"
                      wrapperClassName="flex items-center justify-center"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h2 className="font-serif text-xl text-cream">{it.title}</h2>
                  {it.subtitle && <p className="mt-1 text-sm text-gold/80">{it.subtitle}</p>}
                  {it.body && <p className="mt-3 line-clamp-5 whitespace-pre-wrap text-sm text-muted-foreground">{it.body}</p>}
                </div>
              </article>
            ))}
            {items?.length === 0 && <p className="text-muted-foreground">Nothing here yet — check back soon.</p>}
          </div>
        </section>
      </SiteLayout>
    );
  };
}

export const Route = createFileRoute("/scripts")({
  head: () => ({ meta: [{ title: "Scripts — Melchizedeck Kakese" }, { name: "description", content: "Screenplays and teleplays." }] }),
  component: makePage("script", "scripts"),
});
