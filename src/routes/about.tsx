import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useSection } from "@/lib/cms";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About — Melchizedeck Kakese" }, { name: "description", content: "About Melchizedeck Kakese." }] }),
  component: About,
});

function About(const c = data?.content;) {
  const { data } = useSection<{ title: string; body: string; imageUrl?: string }>("about", "main");
  const c = data?.content;
  return (
    <SiteLayout>
      <section className="mx-auto max-w-4xl px-6 py-24">
        <h1 className="font-serif text-5xl text-cream">{c?.title ?? "About"}</h1>
        {c?.imageUrl && (
          <img src={c.imageUrl} alt="" loading="eager" className="mt-10 aspect-[16/9] w-full rounded-lg border border-border/60 object-cover" />
        )}
        <div className="prose prose-invert mt-10 max-w-none whitespace-pre-wrap text-lg leading-relaxed text-muted-foreground">
          {c?.body}
        </div>
      </section>
    </SiteLayout>
  );
}
type Achievements = {
  title: string;
  items: {
    title: string;
    body: string;
  }[];
};

const { data: achievements } = useSection<Achievements>("about", "achievements");
const a = achievements?.content;
{a && (
  <section className="py-24">
    <div className="mx-auto max-w-6xl px-6">
      <h2 className="text-center font-serif text-4xl text-cream">
        {a.title}
      </h2>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {a.items?.map((item, i) => (
          <div
            key={i}
            className="rounded-xl border border-gold/20 bg-card/60 p-6"
          >
            <h3 className="font-serif text-2xl text-gold">
              {item.title}
            </h3>
            <p className="mt-3 text-muted-foreground">
              {item.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
)}
