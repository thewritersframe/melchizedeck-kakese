import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useSection, useCollection } from "@/lib/cms";
import { SupportVision } from "@/components/site/SupportVision";


export const Route = createFileRoute("/advocacy")({
  head: () => ({ meta: [{ title: "Advocacy & Adventures — Melchizedeck Kakese" }, { name: "description", content: "Youth advocacy work and stories from the road." }] }),
  component: Advocacy,
});

function Advocacy() {
  const { data: header } = useSection<{ title: string; body: string }>("advocacy", "header");
  const { data: items } = useCollection("advocacy");
  const h = header?.content;
  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-6 py-24">
        <h1 className="font-serif text-5xl text-cream">{h?.title}</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">{h?.body}</p>
        <div className="mt-14 grid gap-8 md:grid-cols-2">
          {items?.map((it) => (
            <article key={it.id} className="overflow-hidden rounded-xl border border-border/60 bg-card/60 backdrop-blur">
              {it.image_url && (
                <img src={it.image_url} alt={it.title} loading="lazy" className="aspect-[16/10] w-full object-cover" />
              )}
              <div className="p-6">
                <h2 className="font-serif text-2xl text-cream">{it.title}</h2>
                {it.subtitle && <p className="mt-1 text-sm text-gold/80">{it.subtitle}</p>}
                {it.body && <p className="mt-4 whitespace-pre-wrap text-sm text-muted-foreground">{it.body}</p>}
              </div>
            </article>
          ))}
          {items?.length === 0 && <p className="text-muted-foreground">Stories coming soon.</p>}
        </div>
      </section>
      <SupportVision />
    </SiteLayout>
  );
}

