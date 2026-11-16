import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { pageHead } from "@/lib/seo";
import type { ContentItem } from "@/lib/cms";
import { ShareButtons } from "@/components/site/ShareButtons";
import { LikeButton } from "@/components/site/LikeButton";
import { CommentsSection } from "@/components/site/CommentsSection";

async function fetchPost(slug: string): Promise<ContentItem | null> {
  const id = /^[0-9a-f-]{36}$/i.test(slug) ? slug : "00000000-0000-0000-0000-000000000000";
  const { data, error } = await supabase
    .from("content_items")
    .select("*")
    .eq("collection", "blog")
    .eq("published", true)
    .or(`id.eq.${id},slug.eq.${slug}`)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as ContentItem | null;
}

export const Route = createFileRoute("/blog_/$slug")({
  loader: async ({ params }) => {
    const post = await fetchPost(params.slug);
    if (!post) throw notFound();
    return post;
  },
  head: ({ loaderData, params }) => loaderData
    ? pageHead({
        path: `/blog/${loaderData.slug || params.slug}`,
        title: `${loaderData.title} | Melchizedeck Kakese`,
        description: (loaderData.subtitle || loaderData.body || `An article by Melchizedeck Kakese: ${loaderData.title}`).slice(0, 160),
        type: "article",
        image: loaderData.image_url || undefined,
      })
    : { meta: [{ title: "Article not found" }, { name: "robots", content: "noindex, nofollow" }] },
  notFoundComponent: () => (
    <SiteLayout>
      <main className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="font-serif text-3xl text-cream">Article not found</h1>
        <Link to="/blog" className="mt-6 inline-block text-gold">Back to the blog</Link>
      </main>
    </SiteLayout>
  ),
  component: BlogPostPage,
});

function BlogPostPage() {
  const post = Route.useLoaderData();
  const meta = (post.meta ?? {}) as { category?: string; read_time?: string; audio_url?: string };
  return (
    <SiteLayout>
      <main className="mx-auto max-w-3xl px-6 py-24">
        <Link to="/blog" className="text-sm text-gold hover:underline">← All articles</Link>
        <article className="mt-8">
          <p className="text-xs uppercase tracking-widest text-gold">
            {[meta.category, new Date(post.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }), meta.read_time].filter(Boolean).join(" · ")}
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-cream md:text-5xl">{post.title}</h1>
          {post.subtitle && <p className="mt-4 text-lg text-gold/80">{post.subtitle}</p>}
          {post.image_url && <img src={post.image_url} alt={post.title} className="mt-8 w-full rounded-lg border border-border/60 object-cover" />}
          {post.body && <div className="mt-8 whitespace-pre-wrap text-base leading-8 text-muted-foreground">{post.body}</div>}
          {meta.audio_url && <audio src={meta.audio_url} controls preload="none" className="mt-8 w-full" />}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <LikeButton itemId={post.id} />
            <ShareButtons title={post.title} path={`/blog/${post.slug || post.id}`} text={post.subtitle ?? undefined} />
          </div>
          <CommentsSection itemId={post.id} />
        </article>
      </main>
    </SiteLayout>
  );
}
