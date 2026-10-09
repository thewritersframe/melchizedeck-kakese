import { pageHead } from "@/lib/seo";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useCollection, useSection } from "@/lib/cms";
import { AboutBlocks, parseBlocks } from "@/components/site/AboutBlocks";
import { ExpandableText } from "@/components/site/ExpandableText";
import { Timeline } from "@/components/site/Timeline";

export const Route = createFileRoute("/about")({
  head: () => pageHead({ path: "/about", title: "About Melchizedeck Kakese | Author, Screenwriter & Youth Advocate", description: "The story of Melchizedeck Kakese: Tanzanian author, screenwriter and youth advocate, his milestones, achievements and the journey behind The Writer's Frame.", type: "profile" }),
  component: About,
});

function About() {
  const { data } = useSection<{ title: string; body: string; imageUrl?: string; blocks?: unknown }>("about", "main");
  const { data: achievements } = useCollection("achievement");
  const { data: timeline } = useSection<{ eyebrow?: string; title?: string; body?: string }>("about", "timeline");
  const t = timeline?.content;
  const c = data?.content;
  const blocks = parseBlocks(c?.blocks);
  return (
    <SiteLayout>
      <section className="mx-auto max-w-4xl px-6 py-24">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <h1 className="font-serif text-5xl text-cream">{c?.title ?? "About"}</h1>
        </div>
        {c?.imageUrl && (
          <div className="mt-10 overflow-hidden rounded-lg border border-border/60 bg-background/40">
            <img src={c.imageUrl} alt="Melchizedeck Kakese" loading="eager" className="h-auto w-full object-contain" />
          </div>
        )}
        {blocks.length > 0 ? (
          <AboutBlocks blocks={blocks} />
        ) : (
          c?.body && (
            <ExpandableText
              text={c.body}
              threshold={900}
              className="mt-10 max-w-none text-lg text-muted-foreground"
            />
          )
        )}
      </section>


      {achievements && achievements.length > 0 && (
        <section className="mx-auto max-w-5xl px-6 pb-24">
          <div className="mb-12 border-b border-border/40 pb-4">
            <p className="text-xs font-accent uppercase tracking-[0.3em] text-gold">{t?.eyebrow ?? "Journey"}</p>
            <h2 className="mt-2 font-serif text-3xl text-cream md:text-4xl">{t?.title ?? "Milestones"}</h2>
            {t?.body && <p className="mt-3 max-w-2xl text-muted-foreground">{t.body}</p>}
          </div>
          <Timeline items={achievements} />
        </section>
      )}
    </SiteLayout>
  );
}

