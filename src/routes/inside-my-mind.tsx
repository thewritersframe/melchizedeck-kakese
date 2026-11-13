import { useEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/inside-my-mind")({
  head: () => pageHead({
    path: "/inside-my-mind",
    title: "Inside My Mind | Melchizedeck Kakese",
    description: "An interactive exploration of the ideas, memories, ambitions and stories behind Melchizedeck Kakese.",
  }),
  component: InsideMyMind,
});

function InsideMyMind() {
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const syncTheme = () => {
      const theme = document.documentElement.classList.contains("dark") ? "dark" : "light";
      frame.contentWindow?.postMessage({ type: "portfolio-theme", theme }, window.location.origin);
    };
    syncTheme();
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    frame.addEventListener("load", syncTheme);
    return () => {
      observer.disconnect();
      frame.removeEventListener("load", syncTheme);
    };
  }, []);

  return (
    <SiteLayout>
      <main className="mx-auto w-full max-w-7xl px-4 py-10 md:px-6 md:py-16">
        <div className="mb-7 text-center">
          <p className="text-xs font-accent uppercase tracking-[0.3em] text-gold">Beyond the biography</p>
          <h1 className="mt-3 font-serif text-4xl text-cream md:text-5xl">Inside My Mind</h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">An interactive journey through the thoughts, experiences and aspirations that continue to shape my story.</p>
        </div>
        <div className="overflow-hidden rounded-xl border border-border/60 bg-background/70 shadow-2xl">
          <iframe
            ref={frameRef}
            title="Inside My Mind interactive experience"
            src="/inside-my-mind-experience.html"
            className="block h-[78svh] min-h-[680px] w-full border-0"
            loading="eager"
            allow="fullscreen"
          />
        </div>
        <div className="mt-5 flex justify-center">
          <a href="/inside-my-mind-experience.html" target="_blank" rel="noreferrer" className="text-sm text-gold underline-offset-4 hover:underline">Open the experience in a new tab</a>
        </div>
      </main>
    </SiteLayout>
  );
}
