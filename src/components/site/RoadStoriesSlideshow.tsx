import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpandableText } from "@/components/site/ExpandableText";
import { useCollection, type ContentItem } from "@/lib/cms";
import { latestFirst } from "@/lib/journey";

export function RoadStoriesSlideshow({ initialData }: { initialData: ContentItem[] }) {
  const { data } = useCollection("advocacy", { initialData, refetchInterval: 60_000 });
  const stories = latestFirst(data ?? []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(true);
  const index = Math.max(0, stories.findIndex((story) => story.id === selectedId));
  const story = stories[index];
  const ids = stories.map((item) => item.id).join("|");

  useEffect(() => {
    if (!playing || stories.length < 2) return;
    const timer = window.setTimeout(() => {
      setSelectedId(stories[(index + 1) % stories.length]?.id ?? null);
    }, 60_000);
    return () => window.clearTimeout(timer);
  }, [playing, index, ids]);

  // Warm the next photo without downloading the entire gallery at once.
  const nextImage = stories.length > 1 ? stories[(index + 1) % stories.length]?.image_url : null;
  useEffect(() => {
    if (!nextImage) return;
    const image = new Image();
    image.src = nextImage;
    void image.decode?.().catch(() => {});
  }, [nextImage]);

  if (!story) return null;

  const move = (direction: number) => {
    setSelectedId(stories[(index + direction + stories.length) % stories.length]?.id ?? null);
  };

  return (
    <section aria-labelledby="road-stories-title" className="border-t border-border/40 bg-background py-20">
      <div className="mx-auto max-w-6xl px-6">
        <p className="font-accent text-xs uppercase text-gold">Advocacy & Adventures</p>
        <h2 id="road-stories-title" className="mt-3 font-serif text-4xl text-foreground md:text-5xl">Stories on the Road</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-2 md:items-center">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
            <div aria-hidden className="absolute inset-0 flex items-center justify-center p-8 text-center font-serif text-xl text-muted-foreground">{story.title}</div>
            {story.image_url && <img key={story.image_url} src={story.image_url} alt={story.title} onError={(event) => { event.currentTarget.style.visibility = "hidden"; }} className="relative h-full w-full bg-muted object-contain" loading="eager" decoding="async" />}
          </div>
          <div className="min-w-0">
            <h3 className="break-words font-serif text-3xl text-foreground">{story.title}</h3>
            {story.subtitle && <p className="mt-3 text-gold">{story.subtitle}</p>}
            {story.body && <ExpandableText key={story.id} text={story.body} threshold={420} moreHref="/advocacy" className="mt-4 text-muted-foreground" />}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild><Link to="/advocacy">All stories</Link></Button>
              {stories.length > 1 && <>
                <Button variant="outline" size="icon" onClick={() => move(-1)} aria-label="Previous story" title="Previous story"><ChevronLeft /></Button>
                <Button variant="outline" size="icon" onClick={() => setPlaying((value) => !value)} aria-label={playing ? "Pause stories" : "Play stories"} title={playing ? "Pause stories" : "Play stories"}>{playing ? <Pause /> : <Play />}</Button>
                <Button variant="outline" size="icon" onClick={() => move(1)} aria-label="Next story" title="Next story"><ChevronRight /></Button>
                <span className="text-sm tabular-nums text-muted-foreground">{String(index + 1).padStart(2, "0")} / {String(stories.length).padStart(2, "0")}</span>
              </>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}