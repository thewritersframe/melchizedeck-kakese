import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { SmartImage } from "@/components/site/SmartImage";
import { type AboutPhoto } from "@/components/site/AboutBlocks";

export function AboutGallery({ photos, title }: { photos: AboutPhoto[]; title: string }) {
  const [selected, setSelected] = useState<number | null>(null);
  const photo = selected === null ? undefined : photos[selected];
  if (!photos.length) return null;
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24">
      <h2 className="mb-8 border-b border-border/40 pb-4 font-serif text-3xl text-cream">{title}</h2>
      <div className="grid grid-cols-2 items-start gap-4 md:grid-cols-3">
        {photos.map((item, i) => (
          <figure key={`${item.url}-${i}`}>
            <Button variant="ghost" className="h-auto w-full overflow-hidden rounded-lg p-0" aria-label={`Open photo ${i + 1}`} onClick={() => setSelected(i)}>
              <SmartImage src={item.url} alt={item.caption ?? `Gallery photo ${i + 1}`} loading="lazy" className="h-auto w-full object-contain" wrapperClassName="!h-auto" />
            </Button>
            {item.caption && <figcaption className="mt-2 text-sm text-muted-foreground">{item.caption}</figcaption>}
          </figure>
        ))}
      </div>
      <Dialog open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className="max-w-4xl" aria-describedby={undefined}>
          <DialogTitle className="pr-8">{photo?.caption || title}</DialogTitle>
          {photo && <SmartImage key={photo.url} src={photo.url} alt={photo.caption ?? "Gallery photo"} className="max-h-[70vh] w-full object-contain" wrapperClassName="!h-auto" />}
          <div className="flex items-center justify-between">
            <Button variant="outline" size="icon" aria-label="Previous photo" onClick={() => setSelected((i) => i === null ? 0 : (i - 1 + photos.length) % photos.length)}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="text-sm text-muted-foreground">{selected === null ? 0 : selected + 1} / {photos.length}</span>
            <Button variant="outline" size="icon" aria-label="Next photo" onClick={() => setSelected((i) => i === null ? 0 : (i + 1) % photos.length)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}