import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useSection, useCollection } from "@/lib/cms";
import { CalendarDays, MapPin } from "lucide-react";
import { ExpandableText } from "@/components/site/ExpandableText";

export const Route = createFileRoute("/events")({
  head: () => ({ meta: [{ title: "Events — Melchizedeck Kakese" }, { name: "description", content: "Speaking engagements, readings, and workshops." }] }),
  component: Events,
});

function Events() {
  const { data: header } = useSection<{ title: string; body: string }>("events", "header");
  const { data: items } = useCollection("event");
  const h = header?.content;
  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-6 py-24">
        <h1 className="font-serif text-5xl text-cream">{h?.title}</h1>
        <p className="mt-4 text-muted-foreground">{h?.body}</p>
        <div className="mt-14 space-y-6">
          {[...(items ?? [])]
            .sort((a, b) => {
              const ad = new Date(((a.meta as { date?: string })?.date ?? a.created_at) || 0).getTime();
              const bd = new Date(((b.meta as { date?: string })?.date ?? b.created_at) || 0).getTime();
              return bd - ad;
            })
            .map((ev) => {
            const meta = ev.meta as { date?: string; location?: string; url?: string };
            return (
              <article key={ev.id} className="grid gap-6 rounded-xl border border-border/60 bg-card/60 p-6 backdrop-blur md:grid-cols-[1fr_2fr]">
                {ev.image_url && (
                  <img src={ev.image_url} alt={ev.title} loading="lazy" className="aspect-[4/3] w-full rounded-lg object-cover" />
                )}
                <div>
                  <h2 className="font-serif text-2xl text-cream">{ev.title}</h2>
                  {ev.subtitle && <p className="mt-1 text-gold/80">{ev.subtitle}</p>}
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {meta?.date && <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-gold" /> {meta.date}</span>}
                    {meta?.location && <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-gold" /> {meta.location}</span>}
                  </div>
                  {ev.body && <ExpandableText text={ev.body} className="mt-4 text-sm text-muted-foreground" />}
                  {meta?.url && <a href={meta.url} target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm text-gold hover:underline">Details →</a>}
                </div>
              </article>
            );
          })}
          {items?.length === 0 && <p className="text-muted-foreground">No upcoming events.</p>}
        </div>
      </section>
    </SiteLayout>
  );
}
