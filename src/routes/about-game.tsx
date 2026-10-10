
import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { AboutGame } from "@/components/site/AboutGame";

export const Route = createFileRoute("/about-game")({
  head: () =>
    pageHead({
      path: "/about-game",
      title: "My Journey | Melchizedeck Kakese",
      description:
        "Play through the journey of Melchizedeck Kakese, Tanzanian author, screenwriter and youth advocate.",
    }),
  component: AboutGamePage,
});

function AboutGamePage() {
  return <AboutGame />;
}
