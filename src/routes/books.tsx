import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useSection, useCollection } from "@/lib/cms";

export const Route = createFileRoute("/books")({
  head: () => ({ meta: [{ title: "Books — Melchizedeck Kakese" }, { name: "description", content: "Books by Melchizedeck Kakese." }] }),
  component: Books,
});

function Books() {
  const { data: header } = useSection<{ title: string; body: string }>("books", "header");
  const { data: items } = useCollection("book");
  const h = header?.content;
  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="max-w-2xl">
          <h1 className="font-serif text-5xl text-cream">{h?.title ?? "Books"}</h1>
          <p className="mt-4 text-muted-foreground">{h?.body}</p>
        </div>
        <div className="mt-14 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {items?.map((b) => (
            <article key={b.id} className="group rounded-xl border border-border/60 bg-card/60 p-5 backdrop-blur">
              <div className="aspect-[3/4] w-full overflow-hidden rounded-md border border-border/60 bg-background">
                {b.image_url ? (
                  <img src={b.image_url} alt={b.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full items-center justify-center p-4 text-center font-serif text-xl text-gold/60">{b.title}</div>
                )}
              </div>
              <h2 className="mt-5 font-serif text-2xl text-cream">{b.title}</h2>
              {b.subtitle && <p className="mt-1 text-sm text-gold/80">{b.subtitle}</p>}
              {b.body && <p className="mt-3 line-clamp-4 text-sm text-muted-foreground">{b.body}</p>}
              {(b.meta as { buy_url?: string })?.buy_url && (
                <a href={(b.meta as { buy_url?: string }).buy_url} target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm text-gold hover:underline">
                  Get the book →
                </a>
              )}
            </article>
          ))}
          {items?.length === 0 && <p className="text-muted-foreground">No books yet.</p>}
        </div>
      </section>
    </SiteLayout>
  );
}
