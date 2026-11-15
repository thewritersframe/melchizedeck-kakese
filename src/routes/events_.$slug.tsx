import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { pageHead } from "@/lib/seo";
import type { ContentItem } from "@/lib/cms";
import { CalendarDays, MapPin } from "lucide-react";
import { ShareButtons } from "@/components/site/ShareButtons";

async function fetchEvent(slug: string): Promise<ContentItem | null> {
  const id = /^[0-9a-f-]{36}$/i.test(slug) ? slug : "00000000-0000-0000-0000-000000000000";
  const { data, error } = await supabase
    .from("content_items")
    .select("*")
    .eq("collection", "event")
    .eq("published", true)
    .or(`id.eq.${id},slug.eq.${slug}`)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as ContentItem | null;
}

export const Route = createFileRoute("/events_/$slug")({
  loader: async ({ params }) => {
    const event = await fetchEvent(params.slug);
    if (!event) throw notFound();
    return event;
  },
  head: ({ loaderData, params }) => loaderData
    ? pageHead({
        path: `/events/${loaderData.slug || params.slug}`,
        title: `${loaderData.title} | Events | Melchizedeck Kakese`,
        description: (loaderData.subtitle || loaderData.body || `Event featuring Melchizedeck Kakese: ${loaderData.title}`).slice(0, 160),
        type: "event",
        image: loaderData.image_url || undefined,
      })
    : { meta: [{ title: "Event not found" }, { name: "robots", content: "noindex, nofollow" }] },
  notFoundComponent: () => (
    <SiteLayout>
      <main className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="font-serif text-3xl text-cream">Event not found</h1>
        <Link to="/events" className="mt-6 inline-block text-gold">Back to events</Link>
      </main>
    </SiteLayout>
  ),
  component: EventDetailPage,
});

function EventDetailPage() {
  const event = Route.useLoaderData();
  const meta = (event.meta ?? {}) as { date?: string; location?: string; url?: string };
  return (
    <SiteLayout>
      <main className="mx-auto max-w-3xl px-6 py-24">
        <Link to="/events" className="text-sm text-gold hover:underline">← All events</Link>
        <article className="mt-8">
          <p className="text-xs uppercase tracking-widest text-gold">Event</p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-cream md:text-5xl">{event.title}</h1>
          {event.subtitle && <p className="mt-4 text-lg text-gold/80">{event.subtitle}</p>}
          <div className="mt-5 flex flex-wrap gap-5 text-sm text-muted-foreground">
            {meta.date && <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-gold" />{meta.date}</span>}
            {meta.location && <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-gold" />{meta.location}</span>}
          </div>
          {event.image_url && <img src={event.image_url} alt={event.title} className="mt-8 w-full rounded-lg border border-border/60 object-cover" />}
          {event.body && <div className="mt-8 whitespace-pre-wrap text-base leading-8 text-muted-foreground">{event.body}</div>}
          {meta.url && <a href={meta.url} target="_blank" rel="noreferrer" className="mt-6 inline-block text-gold hover:underline">Official event details ↗</a>}
          <div className="mt-8"><ShareButtons title={event.title} path={`/events/${event.slug || event.id}`} text={event.subtitle ?? undefined} /></div>
        </article>
      </main>
    </SiteLayout>
  );
}
