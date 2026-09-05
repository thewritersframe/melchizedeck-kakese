import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useSection, useCollection } from "@/lib/cms";
import { SupportVision } from "@/components/site/SupportVision";
import { ArrowRight, BookOpen, PenLine, Sparkles } from "lucide-react";
import { EventsSlideshow } from "@/components/site/EventsSlideshow";
import { RotatingHeadline } from "@/components/site/RotatingHeadline";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Melchizedeck Kakese — Author, Screenwriter & Advocate" },
      {
        name: "description",
        content:
          "Books, screenplays, essays and events from Tanzanian author and screenwriter Melchizedeck Kakese.",
      },
      {
        property: "og:title",
        content: "Melchizedeck Kakese — Author, Screenwriter & Advocate",
      },
      {
        property: "og:description",
        content:
          "Books, screenplays, essays and events from Tanzanian author and screenwriter Melchizedeck Kakese.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Hero = {
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaPrimaryLabel: string;
  ctaPrimaryTo: string;
  ctaSecondaryLabel: string;
  ctaSecondaryTo: string;
  videoUrl?: string;
  posterUrl?: string;
  rotatingPrefix?: string;
  rotatingPhrases?: string[] | string;
};

const DEFAULT_HERO_VIDEO = "/VID_20260817_122335_118%20%282%29.mp4";
const DEFAULT_HERO_POSTER = "/20260705_145620.jpg";

type Featured = {
  label: string;
  title: string;
  body: string;
  imageUrl: string;
  primaryLabel: string;
  primaryTo: string;
  secondaryLabel: string;
  secondaryTo: string;
};

type Pillars = {
  eyebrow?: string;
  title: string;
  items: { title: string; body: string }[];
  projectsLabel?: string;
  projectsNote?: string;
};

const ICONS = [PenLine, Users, HeartHandshake, BookOpen, Sparkles];

const DEFAULT_PILLARS: Pillars = {
  eyebrow: "What I Do",
  title: "What I Do",
  items: [
    { title: "Writing & Publishing", body: "Placeholder text. Books, essays and screenplays that carry African stories to wider audiences." },
    { title: "Youth Advocacy", body: "Placeholder text. Programmes and mentorship that help young people find and use their voice." },
    { title: "Leadership & Community Work", body: "Placeholder text. Building teams, platforms and communities that outlast a single project." },
  ],
};

function Index() {
  const { data: hero } = useSection<Hero>("home", "hero");
  const { data: featured } = useSection<Featured>("home", "featured");
  const { data: pillars } = useSection<Pillars>("home", "pillars");
  const { data: books } = useCollection("book");

  const h = hero?.content;
  const f = featured?.content;
  const p = pillars?.content;

  const featuredImage = f?.imageUrl || books?.[0]?.image_url || "";

  const heroVideo = (h?.videoUrl || "").trim() || DEFAULT_HERO_VIDEO;
  const heroPoster = (h?.posterUrl || "").trim() || DEFAULT_HERO_POSTER;
  const phrases = Array.isArray(h?.rotatingPhrases)
    ? h?.rotatingPhrases
    : String(h?.rotatingPhrases ?? "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative -mt-px min-h-[88svh] overflow-hidden">
        {/* Background video */}
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url("${heroPoster}")` }}
        />
        <video
          key={heroVideo}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={heroPoster}
          src={heroVideo}
          onLoadedData={(e) => {
            const v = e.currentTarget;
            v.style.opacity = "1";
            void v.play().catch(() => {});
          }}
          onError={(e) => { e.currentTarget.style.display = "none"; }}
          className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700"
        />

        {/* Dark overlay for readable text */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Hero content */}
        <div className="relative z-10 mx-auto flex min-h-[88svh] max-w-4xl flex-col items-center justify-center px-6 py-24 text-center">
          <p className="text-xs font-medium font-accent uppercase tracking-[0.3em] text-gold">
            {h?.eyebrow}
          </p>

          <RotatingHeadline prefix={h?.rotatingPrefix || "I am"} phrases={phrases} />

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/90 md:text-lg">
            {h?.subtitle}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {h?.ctaPrimaryLabel && (
              <Link
                to={h.ctaPrimaryTo || "/books"}
                className="inline-flex items-center gap-2 rounded-md bg-gold px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                {h.ctaPrimaryLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}

            {h?.ctaSecondaryLabel && (
              <Link
                to={h.ctaSecondaryTo || "/blog"}
                className="inline-flex rounded-md border border-white/50 px-6 py-3 text-sm text-white transition hover:bg-white/10"
              >
                {h.ctaSecondaryLabel}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* FEATURED */}
      {f && (
        <section className="border-t border-border/40 bg-background py-24">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-2 md:items-center">
            <div className="order-2 md:order-1">
              <p className="text-xs font-medium font-accent uppercase tracking-[0.3em] text-gold">
                {f.label}
              </p>

              <h2 className="mt-4 font-serif text-4xl text-foreground">
                {f.title}
              </h2>

              <p className="mt-4 text-muted-foreground">
                {f.body}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to={f.primaryTo || "/books"}
                  className="rounded-md bg-gold px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                >
                  {f.primaryLabel}
                </Link>

                <Link
                  to={f.secondaryTo || "/books"}
                  className="rounded-md border border-border px-5 py-2.5 text-sm text-foreground transition hover:bg-muted"
                >
                  {f.secondaryLabel}
                </Link>
              </div>
            </div>

            <div className="order-1 md:order-2">
              <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-lg border border-gold/20 bg-card shadow-2xl shadow-black/20">
                {featuredImage ? (
                  <img
                    src={featuredImage}
                    alt={f.title}
                    loading="eager"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center p-8 text-center font-serif text-2xl text-gold/70">
                    {f.title}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* EVENTS SLIDESHOW */}
      <EventsSlideshow />

      {/* PILLARS */}
      {p && (
        <section className="bg-background py-24">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-center font-serif text-4xl text-foreground">
              {p.title}
            </h2>

            <div className="mt-14 grid gap-8 md:grid-cols-3">
              {p.items?.map((item, i) => {
                const Icon = ICONS[i % ICONS.length];

                return (
                  <div
                    key={i}
                    className="rounded-xl border border-border/60 bg-card p-8 shadow-sm transition hover:border-gold/40"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 text-gold">
                      <Icon className="h-5 w-5" />
                    </div>

                    <h3 className="mt-6 font-serif text-2xl text-foreground">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {item.body}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* SUPPORT */}
      <SupportVision />
    </SiteLayout>
  );
}
