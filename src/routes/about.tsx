import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useSection } from "@/lib/cms";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About — Melchizedeck Kakese" }, { name: "description", content: "About Melchizedeck Kakese." }] }),
  component: About,
});

function About() {
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
