import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Play, Pause, CalendarDays, MapPin } from "lucide-react";
import { useCollection, type ContentItem } from "@/lib/cms";
import { latestFirst } from "@/lib/journey";
import { ExpandableText } from "@/components/site/ExpandableText";

type EventMeta = { date?: string; location?: string; url?: string };

export function EventsSlideshow({ initialData }: { initialData?: ContentItem[] }) {
  const { data: items } = useCollection("event", { initialData });

  const events = useMemo(
    () => latestFirst(items ?? []).slice(0, 6),
    [items],
  );

  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [ready, setReady] = useState<Record<string, boolean>>({});
  const timer = useRef<number | null>(null);

  const next = useCallback(() => setCurrent((p) => (events.length ? (p + 1) % events.length : 0)), [events.length]);
  const previous = useCallback(
    () => setCurrent((p) => (events.length ? (p === 0 ? events.length - 1 : p - 1) : 0)),
    [events.length],
  );

  // Preload & decode every slide image up front so slides never flash or break.
  useEffect(() => {
    let cancelled = false;
    events.forEach((ev) => {
      if (!ev.image_url) return;
      const img = new Image();
      img.decoding = "async";
      img.src = ev.image_url;
      const done = () => {
        if (!cancelled) setReady((r) => (r[ev.id] ? r : { ...r, [ev.id]: true }));
      };
      if (img.decode) img.decode().then(done).catch(done);
      else {
        img.onload = done;
        img.onerror = done;
      }
    });
    return () => {
      cancelled = true;
    };
  }, [events]);

  useEffect(() => {
    if (!playing || events.length < 2) return;
    timer.current = window.setInterval(next, 6500);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [playing, next, events.length]);

  if (!events.length) return null;

  const activeIndex = current % events.length;
  const ev = events[activeIndex];
  const meta = (ev.meta ?? {}) as EventMeta;

  return (
    <section className="relative overflow-hidden border-t border-border/40">
      <div className="relative min-h-[520px] md:min-h-[620px]">
        {events.map((e, i) => (
          <div
            key={e.id}
            aria-hidden={i !== activeIndex}
            className={`absolute inset-0 transition-opacity duration-700 ${i === activeIndex ? "opacity-100" : "opacity-0"}`}
          >
            {e.image_url && (
              <img
                src={e.image_url}
                alt={e.title}
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : "low"}
                decoding="async"
                sizes="100vw"
                className={`h-full w-full object-cover transition-opacity duration-500 ${ready[e.id] ? "opacity-100" : "opacity-0"}`}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
          </div>
        ))}

        <div className="relative z-10 flex min-h-[520px] items-end md:min-h-[620px]">
          <div className="mx-auto w-full max-w-6xl px-6 py-14 md:py-20">
            <p className="text-xs font-medium font-accent uppercase tracking-[0.3em] text-gold">Events</p>
            <h2 className="mt-4 max-w-3xl font-serif text-4xl leading-tight text-cream md:text-5xl">{ev.title}</h2>
            {ev.subtitle && <p className="mt-3 max-w-2xl text-gold/80">{ev.subtitle}</p>}
            <div className="mt-4 flex flex-wrap gap-5 text-sm text-muted-foreground">
              {meta.date && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-gold" /> {meta.date}
                </span>
              )}
              {meta.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-gold" /> {meta.location}
                </span>
              )}
            </div>
            {ev.body && <ExpandableText key={ev.id} text={ev.body} className="mt-4 max-w-2xl text-sm text-muted-foreground" />}

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/events" className="rounded-md bg-gold px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90">
                All events
              </Link>
              {meta.url && (
                <a href={meta.url} target="_blank" rel="noreferrer" className="rounded-md border border-cream/30 px-5 py-2.5 text-sm text-cream hover:bg-cream/5">
                  Details
                </a>
              )}
              {events.length > 1 && (
                <div className="flex items-center gap-2">
                  <button onClick={previous} aria-label="Previous event" className="rounded-full border border-cream/30 p-2.5 text-cream transition hover:bg-cream/10">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPlaying((p) => !p)}
                    aria-label={playing ? "Pause slideshow" : "Play slideshow"}
                    className="rounded-full border border-cream/30 p-2.5 text-cream transition hover:bg-cream/10"
                  >
                    {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </button>
                  <button onClick={next} aria-label="Next event" className="rounded-full border border-cream/30 p-2.5 text-cream transition hover:bg-cream/10">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <span className="ml-2 text-sm text-muted-foreground">
                    {String(activeIndex + 1).padStart(2, "0")} / {String(events.length).padStart(2, "0")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
