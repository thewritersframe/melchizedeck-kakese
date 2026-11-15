import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { SITE_URL } from "@/lib/seo";

const STATIC_PATHS = [
  "/",
  "/about",
  "/advocacy",
  "/blog",
  "/books",
  "/contact",
  "/events",
  "/projects",
  "/scripts",
  "/speeches",
] as const;

const COLLECTION_PATHS: Record<string, string> = {
  blog: "/blog",
  event: "/events",
  script: "/scripts",\n  book: "/library/book",\n  project: "/library/project",\n  speech: "/library/speech",
};

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function urlEntry(path: string, lastmod?: string | null): string {
  const date = lastmod ? new Date(lastmod) : null;
  const validDate = date && !Number.isNaN(date.getTime()) ? date.toISOString().slice(0, 10) : null;
  return `  <url>
    <loc>${escapeXml(`${SITE_URL}${path}`)}</loc>
    ${validDate ? `<lastmod>${validDate}</lastmod>` : ""}
  </url>`;
}

async function buildSitemap(): Promise<string> {
  const { data, error } = await supabase
    .from("content_items")
    .select("id, collection, slug, updated_at, created_at")
    .eq("published", true);

  if (error) {
    console.error("[sitemap] Could not load published content:", error.message);
    throw error;
  }

  const entries = new Map<string, string>();

  for (const path of STATIC_PATHS) {
    entries.set(path, urlEntry(path));
  }

  for (const item of data ?? []) {
    const basePath = COLLECTION_PATHS[item.collection];
    if (!basePath) continue;
    const identifier = item.slug?.trim() || item.id;
    if (!identifier) continue;
    const path = `${basePath}/${encodeURIComponent(identifier)}`;
    entries.set(path, urlEntry(path, item.updated_at || item.created_at));
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Array.from(entries.values()).join("\n")}
</urlset>`;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const xml = await buildSitemap();
          return new Response(xml, {
            status: 200,
            headers: {
              "content-type": "application/xml; charset=utf-8",
              "cache-control": "public, max-age=900, stale-while-revalidate=3600",
            },
          });
        } catch {
          return new Response("Sitemap temporarily unavailable", {
            status: 503,
            headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
          });
        }
      },
    },
  },
});
