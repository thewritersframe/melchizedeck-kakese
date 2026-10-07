import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpen } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { pageHead } from "@/lib/seo";
import type { ContentItem } from "@/lib/cms";

const scriptQuery = (id: string) => ({
  queryKey: ["script-item", id],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("content_items")
      .select("*")
      .eq("collection", "script")
      .eq("published", true)
      .or(`id.eq.${/^[0-9a-f-]{36}$/i.test(id) ? id : "00000000-0000-0000-0000-000000000000"},slug.eq.${id}`)
      .maybeSingle();
    if (error) throw error;
    return (data as unknown as ContentItem | null);
  },
});

export const Route = createFileRoute("/scripts_/$id")({
  loader: async ({ params, context }) => {
    const item = await context.queryClient.ensureQueryData(scriptQuery(params.id));
    if (!item) throw notFound();
    return { title: item.title, logline: item.body ?? "" };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Synopsis not found" }, { name: "robots", content: "noindex" }] };
    return pageHead({
      path: `/scripts/${params.id}`,
      title: `${loaderData.title} — Synopsis | Melchizedeck Kakese`,
      description: (loaderData.logline || `Read the synopsis of ${loaderData.title}, a screenplay by Melchizedeck Kakese.`).slice(0, 160),
      type: "article",
    });
  },
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="font-serif text-3xl text-cream">Synopsis not found</h1>
        <Link to="/scripts" className="mt-6 inline-block text-gold">Back to scripts</Link>
      </div>
    </SiteLayout>
  ),
  component: SynopsisPage,
});

function SynopsisPage() {
  const { id } = Route.useParams();
  const { data: item } = useSuspenseQuery(scriptQuery(id));
  if (!item) return null;
  const m = (item.meta ?? {}) as { synopsis?: string; genre?: string; status?: string };
  const synopsis = m.synopsis?.trim() || item.body || "No synopsis available yet.";
  return (
    <SiteLayout>
      <article className="mx-auto max-w-3xl px-6 py-20">
        <Link to="/scripts" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-gold">
          <ArrowLeft className="h-4 w-4" /> All scripts
        </Link>
        <div className="mt-8 flex items-center gap-2 text-gold">
          <BookOpen className="h-5 w-5" />
          <span className="text-xs uppercase tracking-widest">Synopsis</span>
          {m.genre && <span className="text-xs uppercase tracking-widest text-muted-foreground">· {m.genre}</span>}
        </div>
        <h1 className="mt-3 font-serif text-4xl text-cream md:text-5xl">{item.title}</h1>
        {item.subtitle && <p className="mt-2 text-gold/80">{item.subtitle}</p>}
        {item.image_url && (
          <img src={item.image_url} alt={item.title} className="mx-auto mt-8 max-h-[32rem] w-auto max-w-full rounded-lg object-contain" />
        )}
        <div className="mt-8 whitespace-pre-wrap text-base leading-relaxed text-muted-foreground">{synopsis}</div>
      </article>
    </SiteLayout>
  );
}
