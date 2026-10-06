import { createFileRoute } from "@tanstack/react-router";

const BASE_URL = "https://melchizedeck-kakese.vercel.app";

// Publicly accessible pages only — no admin, auth, unlock, or utility routes.
const PUBLIC_PATHS = [
  "/",
  "/about",
  "/about-game",
  "/advocacy",
  "/blog",
  "/books",
  "/contact",
  "/events",
  "/projects",
  "/scripts",
  "/speeches",
] as const;

function buildSitemap(): string {
  const lastmod = new Date().toISOString().split("T")[0];
  const urls = PUBLIC_PATHS.map(
    (path) => `  <url>
    <loc>${BASE_URL}${path === "/" ? "/" : path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${path === "/" ? "weekly" : "monthly"}</changefreq>
    <priority>${path === "/" ? "1.0" : "0.8"}</priority>
  </url>`,
  ).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () =>
        new Response(buildSitemap(), {
          status: 200,
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        }),
    },
  },
});
