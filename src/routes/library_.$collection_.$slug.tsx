import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { pageHead } from "@/lib/seo";
import type { ContentItem } from "@/lib/cms";

const ALLOWED_COLLECTIONS = ["book", "project", "speech"] as const;

async function fetchPublicItem(collection: string, slug: string): Promise<ContentItem | null> {
  if (!ALLOWED_COLLECTIONS.includes(collection as typeof ALLOWED_COLLECTIONS[number])) return null;
  const id = /^[0-9a-f-]{36}$/i.test(slug) ? slug : "00000000-0000-0000-0000-000000000000";
  const { data, error } = await supabase
    .from("content_items")
    .select("*")
    .eq("collection", collection)
    .eq("published", true)
    .or(`id.eq.${id},slug.eq.${slug}`)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as ContentItem | null;
}

const COLLECTION_LABELS: Record<string, string> = {
  book: "Books",
  project: "Projects",
  speech: "Speeches",
};

const COLLECTION_PATHS: Record<string, string> = {
  book: "/books",
  project: "/projects",
  speech: "/speeches",
};

export const Route = createFileRoute("/library_/$collection_/$slug")({
  loader: async ({ params }) => {
    const item = await fetchPublicItem(params.collection, params.slug);
    if (!item) throw notFound();
    return item;
  },
  head: ({ loaderData, params }) => loaderData
    ? pageHead({
        path: `/library/${params.collection}/${loaderData.slug || params.slug}`,
        title: `${loaderData.title} | ${COLLECTION_LABELS[params.collection] || "Work"} | Melchizedeck Kakese`,
        description: (loaderData.subtitle || loaderData.body || `${COLLECTION_LABELS[params.collection] || "Work"} by Melchizedeck Kakese: ${loaderData.title}`).slice(0, 160),
        type: params.collection === "speech" ? "video.other" : "article",
        image: loaderData.image_url || undefined,
      })
    : { meta: [{ title: "Content not found" }, { name: "robots", content: "noindex, nofollow" }] },
  notFoundComponent: () => (
    <SiteLayout>
      <main className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="font-serif text-3xl text-cream">Content not found</h1>
        <Link to="/" className="mt-6 inline-block text-gold">Return home</Link>
      </main>
    </SiteLayout>
  ),
  component: PublicContentPage,
});

function PublicContentPage() {
  const item = Route.useLoaderData();
  const meta = (item.meta ?? {}) as Record<string, unknown>;
  const collection = item.collection;
  const backPath = COLLECTION_PATHS[collection] || "/";
  const backLabel = COLLECTION_LABELS[collection] || "All work";
  const external = String(meta.buy_url || meta.url || meta.external_url || "");
  const sample = String(meta.sample_url || "");
  const video = String(meta.video_url || "");
  return (
    <SiteLayout>
      <main className="mx-auto max-w-3xl px-6 py-24">
        <Link to={backPath as "/books" | "/projects" | "/speeches"} className="text-sm text-gold hover:underline">← All {backLabel.toLowerCase()}</Link>
        <article className="mt-8">
          <p className="text-xs uppercase tracking-widest text-gold">{backLabel}</p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-cream md:text-5xl">{item.title}</h1>
          {item.subtitle && <p className="mt-4 text-lg text-gold/80">{item.subtitle}</p>}
          {item.image_url && <img src={item.image_url} alt={item.title} className="mt-8 max-h-[36rem] w-full rounded-lg border border-border/60 object-contain" />}
          {item.body && <div className="mt-8 whitespace-pre-wrap text-base leading-8 text-muted-foreground">{item.body}</div>}
          <div className="mt-8 flex flex-wrap gap-3">
            {external && <a href={external} target="_blank" rel="noreferrer" className="rounded-md bg-gold px-4 py-2 text-sm font-medium text-primary-foreground">Visit / Learn more ↗</a>}
            {sample && <a href={sample} target="_blank" rel="noreferrer" className="rounded-md border border-border px-4 py-2 text-sm text-cream hover:border-gold">Read sample ↗</a>}
            {video && <a href={video} target="_blank" rel="noreferrer" className="rounded-md border border-border px-4 py-2 text-sm text-cream hover:border-gold">Watch recording ↗</a>}
          </div>
        </article>
      </main>
    </SiteLayout>
  );
}
