import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useCollection, useSection } from "@/lib/cms";
import { SmartImage } from "@/components/site/SmartImage";
import { ExpandableText } from "@/components/site/ExpandableText";
import { ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — Melchizedeck Kakese" },
      {
        name: "description",
        content:
          "Initiatives founded and supported by Melchizedeck Kakese — writing platforms, youth programmes and community work.",
      },
      { property: "og:title", content: "Projects — Melchizedeck Kakese" },
      {
        property: "og:description",
        content: "Initiatives founded and supported by Melchizedeck Kakese.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Projects,
});

function Projects() {
  const { data: header } = useSection<{ title?: string; body?: string }>("projects", "header");
  const { data: projects } = useCollection("project");
  const h = header?.content;

  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-6 py-24">
        <p className="text-xs font-accent uppercase tracking-[0.3em] text-gold">Portfolio</p>
        <h1 className="mt-3 font-serif text-5xl text-cream">{h?.title ?? "Projects"}</h1>
        {h?.body && <p className="mt-4 max-w-2xl text-muted-foreground">{h.body}</p>}

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(projects ?? []).map((p) => {
            const meta = (p.meta ?? {}) as { role?: string; url?: string };
            const role = meta.role || p.subtitle || "";
            return (
              <article
                key={p.id}
                className="flex h-full flex-col overflow-hidden rounded-xl border border-border/60 bg-card/70 transition hover:border-gold/50"
              >
                {p.image_url && (
                  <div className="aspect-[16/10] w-full overflow-hidden bg-background/60">
                    <SmartImage src={p.image_url} alt={p.title} className="h-full w-full object-contain" fallbackLabel={p.title} />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-6">
                  <h2 className="font-serif text-2xl text-foreground">{p.title}</h2>
                  {role && (
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-gold/80">{role}</p>
                  )}
                  {p.body && (
                    <ExpandableText text={p.body} threshold={220} className="mt-4 text-sm text-muted-foreground" />
                  )}
                  {meta.url && (
                    <a
                      href={meta.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-6 inline-flex items-center gap-1.5 self-start text-xs font-medium uppercase tracking-widest text-gold hover:opacity-80"
                    >
                      Visit <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {(!projects || projects.length === 0) && (
          <p className="mt-14 text-muted-foreground">Projects will be listed here soon.</p>
        )}
      </section>
    </SiteLayout>
  );
}
