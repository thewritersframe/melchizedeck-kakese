import { pageHead } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useSection, useCollection } from "@/lib/cms";
import { SupportVision } from "@/components/site/SupportVision";
import { ExpandableText } from "@/components/site/ExpandableText";


export const Route = createFileRoute("/advocacy")({
  head: () => pageHead({ path: "/advocacy", title: "Youth Advocacy & Adventures | Melchizedeck Kakese", description: "Youth advocacy work, community initiatives and stories from the road by Melchizedeck Kakese, empowering young people to find their voices.", type: "website" }),
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
                <img src={it.image_url} alt={it.title} loading="lazy" className="aspect-[16/10] w-full object-contain bg-muted" />
              )}
              <div className="p-6">
                <h2 className="font-serif text-2xl text-cream">{it.title}</h2>
                {it.subtitle && <p className="mt-1 text-sm text-gold/80">{it.subtitle}</p>}
                {it.body && <ExpandableText text={it.body} className="mt-4 text-sm text-muted-foreground" />}
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

