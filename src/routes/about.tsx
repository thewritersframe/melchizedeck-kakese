import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useCollection, useSection } from "@/lib/cms";
import { SmartImage } from "@/components/site/SmartImage";
import { AboutBlocks, parseBlocks } from "@/components/site/AboutBlocks";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Melchizedeck Kakese" },
      { name: "description", content: "The story, the work and the achievements of Melchizedeck Kakese — author, screenwriter and youth advocate." },
      { property: "og:title", content: "About Melchizedeck Kakese" },
      { property: "og:description", content: "The story, the work and the achievements of Melchizedeck Kakese." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

function About() {
  const { data } = useSection<{ title: string; body: string; imageUrl?: string; blocks?: unknown }>("about", "main");
  const { data: achievements } = useCollection("achievement");
  const c = data?.content;
  const blocks = parseBlocks(c?.blocks);
  return (
    <SiteLayout>
      <section className="mx-auto max-w-4xl px-6 py-24">
        <h1 className="font-serif text-5xl text-cream">{c?.title ?? "About"}</h1>
        {c?.imageUrl && (
          <div className="mt-10 overflow-hidden rounded-lg border border-border/60 bg-background/40">
            <img src={c.imageUrl} alt="Melchizedeck Kakese" loading="eager" className="h-auto w-full object-contain" />
          </div>
        )}
        {blocks.length > 0 ? (
          <AboutBlocks blocks={blocks} />
        ) : (
          <div className="prose prose-invert mt-10 max-w-none whitespace-pre-wrap text-lg leading-relaxed text-muted-foreground">
            {c?.body}
          </div>
        )}
      </section>


      {achievements && achievements.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="mb-8 flex items-end justify-between border-b border-border/40 pb-4">
            <div>
              <p className="text-xs font-accent uppercase tracking-[0.3em] text-gold">Gallery</p>
              <h2 className="mt-2 font-serif text-3xl text-cream md:text-4xl">Achievements</h2>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {achievements.map((a) => {
              const meta = (a.meta ?? {}) as { year?: string; location?: string; url?: string };
              const card = (
                <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-border/60 bg-background/40 transition hover:border-gold/60">
                  {a.image_url && (
                    <div className="aspect-[4/3] w-full overflow-hidden bg-background/60">
                      <SmartImage src={a.image_url} alt={a.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-serif text-xl text-cream">{a.title}</h3>
                    {(meta.year || meta.location) && (
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-gold/80">
                        {[meta.year, meta.location].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    {a.subtitle && <p className="mt-2 text-sm text-muted-foreground">{a.subtitle}</p>}
                    {a.body && <ExpandableText text={a.body} threshold={180} className="mt-3 text-sm text-muted-foreground" />}
                  </div>
                </article>
              );
              return meta.url ? (
                <a key={a.id} href={meta.url} target="_blank" rel="noreferrer">{card}</a>
              ) : (
                <div key={a.id}>{card}</div>
              );
            })}
          </div>
        </section>
      )}
    </SiteLayout>
  );
}

