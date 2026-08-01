import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Heart } from "lucide-react";

export const Route = createFileRoute("/support-thanks")({
  head: () => ({
    meta: [
      { title: "Thank You for Supporting the Vision — Melchizedeck Kakese" },
      { name: "description", content: "Your contribution helps fund books, screenplays and youth advocacy work across Africa." },
      { property: "og:title", content: "Thank You for Supporting the Vision" },
      { property: "og:description", content: "Your contribution helps fund books, screenplays and youth advocacy work across Africa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SupportThanks,
});

function SupportThanks() {
  const ref = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("ref") : null;
  return (
    <SiteLayout>
      <section className="mx-auto max-w-xl px-6 py-28 text-center">
        <Heart className="mx-auto h-10 w-10 text-gold" />
        <h1 className="mt-6 font-serif text-4xl text-cream">Thank you</h1>
        <p className="mt-4 text-muted-foreground">
          Your contribution has been received. It goes directly into the work — new books,
          screenplays, and youth advocacy across the continent.
        </p>
        {ref && (
          <p className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">
            Reference: <span className="text-gold">{ref}</span>
          </p>
        )}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link to="/" className="rounded-md bg-gold px-5 py-2.5 text-sm text-primary-foreground hover:opacity-90">Back home</Link>
          <Link to="/books" className="rounded-md border border-border px-5 py-2.5 text-sm text-muted-foreground hover:text-gold">Explore the books</Link>
        </div>
      </section>
    </SiteLayout>
  );
}
