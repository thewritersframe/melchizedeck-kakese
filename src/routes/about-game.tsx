import { pageHead } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";
import { AboutGame, type AboutGameContent } from "@/components/site/AboutGame";
import { fetchSection, useSection } from "@/lib/cms";

export const Route = createFileRoute("/about-game")({
  loader: () => fetchSection<AboutGameContent>("about-game", "main").catch(() => null),
  head: () => pageHead({ path: "/about-game", title: "About Me: Interactive Journey | Melchizedeck Kakese", description: "Explore Melchizedeck Kakese's story through an interactive journey across writing, youth advocacy and community leadership in Tanzania.", type: "website" }),
    meta: [
      { title: "About Me: Game Mode — Melchizedeck Kakese" },
      { name: "description", content: "Explore the story of Melchizedeck Kakese through an original interactive journey." },
      { property: "og:title", content: "About Me: Game Mode — Melchizedeck Kakese" },
      { property: "og:description", content: "An interactive journey through writing, youth advocacy and community leadership." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutGamePage,
});

function AboutGamePage() {
  const initialData = Route.useLoaderData();
  const { data } = useSection<AboutGameContent>("about-game", "main", { initialData });
  return <AboutGame content={data?.content} />;
}