import { pageHead } from "@/lib/seo";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useCollection, useSection } from "@/lib/cms";
import { AboutBlocks, parseBlocks, type AboutPhoto } from "@/components/site/AboutBlocks";
import { ExpandableText } from "@/components/site/ExpandableText";
import { Timeline } from "@/components/site/Timeline";
import { AboutGallery } from "@/components/site/AboutGallery";

export const Route = createFileRoute("/about")({
  head: () => pageHead({ path: "/about", title: "About Melchizedeck Kakese | Author, Screenwriter & Youth Advocate", description: "The story of Melchizedeck Kakese: Tanzanian author, screenwriter and youth advocate, his milestones, achievements and the journey behind The Writer's Frame.", type: "profile" }),
  component: About,
});

function About() {
  const { data } = useSection<{ title: string; body: string; imageUrl?: string; blocks?: unknown; gallery?: unknown; galleryTitle?: string }>("about", "main");
  const { data: achievements } = useCollection("achievement");
  const { data: timeline } = useSection<{ eyebrow?: string; title?: string; body?: string }>("about", "timeline");
  const t = timeline?.content;
  const c = data?.content;
  const blocks = parseBlocks(c?.blocks);
  const gallery = parseBlocks(c?.gallery).filter((b): b is AboutPhoto => b.type === "image" && Boolean(b.url));
  const biographyPhotos = blocks.flatMap((b) => b.type === "image" && b.url ? [b] : b.type === "text" && b.photo?.url ? [b.photo] : []);
  const galleryPhotos = gallery.length ? gallery : biographyPhotos.length ? biographyPhotos : c?.imageUrl ? [{ type: "image" as const, url: c.imageUrl, caption: "Melchizedeck Kakese" }] : [];
  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-6 py-24">
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


      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="overflow-hidden rounded-xl border border-gold/30 bg-background/70 px-7 py-10 text-center shadow-lg md:px-12">
          <p className="text-xs font-accent uppercase tracking-[0.3em] text-gold">A personal experience</p>
          <h2 className="mt-3 font-serif text-3xl text-cream md:text-4xl">Inside My Mind</h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">Step beyond the biography and explore the ideas, memories, ambitions and stories that shape my world.</p>
          <Link to="/inside-my-mind" className="mt-7 inline-flex items-center justify-center rounded-md border border-gold/60 bg-gold px-6 py-3 text-sm font-medium text-background transition hover:bg-gold/90">Explore Inside My Mind</Link>
        </div>
      </section>

      <AboutGallery photos={galleryPhotos} title={c?.galleryTitle || "Photo Gallery"} />

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

