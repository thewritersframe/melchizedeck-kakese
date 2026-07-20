import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useSection, useCollection } from "@/lib/cms";

export const Route = createFileRoute("/blog")({
  head: () => ({ meta: [{ title: "Blog — Melchizedeck Kakese" }, { name: "description", content: "Essays and reflections." }] }),
  component: Blog,
});

function Blog() {
  const { data: header } = useSection<{ title: string; body: string }>("blog", "header");
  const { data: items } = useCollection("blog");
  const h = header?.content;
  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-6 py-24">
        <h1 className="font-serif text-5xl text-cream">{h?.title}</h1>
        <p className="mt-4 text-muted-foreground">{h?.body}</p>
        <div className="mt-14 space-y-10">
          {items?.map((post) => (
            <article key={post.id} className="border-b border-border/40 pb-10">
              <p className="text-xs uppercase tracking-widest text-gold">{new Date(post.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</p>
              <h2 className="mt-2 font-serif text-3xl text-cream">{post.title}</h2>
              {post.subtitle && <p className="mt-1 text-gold/80">{post.subtitle}</p>}
              {post.image_url && (
                <img src={post.image_url} alt={post.title} loading="lazy" className="mt-6 aspect-[16/9] w-full rounded-lg border border-border/60 object-cover" />
              )}
              {post.body && <p className="mt-6 whitespace-pre-wrap leading-relaxed text-muted-foreground">{post.body}</p>}
            </article>
          ))}
          {items?.length === 0 && <p className="text-muted-foreground">No essays yet.</p>}
        </div>
      </section>
    </SiteLayout>
  );
}
