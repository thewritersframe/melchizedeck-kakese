import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, ImageIcon, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { uploadMedia } from "@/lib/cms";
import { parseBlocks, type AboutBlock } from "@/components/site/AboutBlocks";

/**
 * Admin editor for a page built out of paragraph + image blocks,
 * so photos can sit mid-paragraph and keep their own aspect ratio.
 */
export function BlocksEditor({ value, onChange }: { value: unknown; onChange: (v: AboutBlock[]) => void }) {
  const blocks = parseBlocks(value);
  const set = (i: number, patch: Partial<AboutBlock>) => {
    const next = blocks.map((b, idx) => (idx === i ? ({ ...b, ...patch } as AboutBlock) : b));
    onChange(next);
  };
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= blocks.length) return;
    const next = [...blocks];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const remove = (i: number) => onChange(blocks.filter((_, idx) => idx !== i));

  return (
    <div className="rounded-lg border border-border/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">Story blocks (paragraphs & photos)</span>
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => onChange([...blocks, { type: "text", text: "" }])}>
            <Plus className="mr-1 h-3.5 w-3.5" /> Paragraph
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => onChange([...blocks, { type: "image", url: "", width: "full", align: "center" }])}>
            <Plus className="mr-1 h-3.5 w-3.5" /> Photo
          </Button>
        </div>
      </div>

      {blocks.length === 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          No blocks yet — the plain “Body” text above is shown instead. Add paragraphs and photos here to build a longer, illustrated story.
        </p>
      )}

      <div className="mt-4 space-y-4">
        {blocks.map((b, i) => (
          <div key={i} className="rounded-md border border-border/50 bg-background/40 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-widest text-gold/80">
                {i + 1}. {b.type === "text" ? "Paragraph" : "Photo"}
              </span>
              <div className="flex items-center gap-1">
                <Button type="button" size="icon" variant="ghost" onClick={() => move(i, -1)} aria-label="Move up"><ArrowUp className="h-4 w-4" /></Button>
                <Button type="button" size="icon" variant="ghost" onClick={() => move(i, 1)} aria-label="Move down"><ArrowDown className="h-4 w-4" /></Button>
                <Button type="button" size="icon" variant="ghost" onClick={() => remove(i)} aria-label="Delete block"><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>

            {b.type === "text" ? (
              <Textarea rows={5} value={b.text ?? ""} onChange={(e) => set(i, { text: e.target.value })} placeholder="Write this part of the story…" />
            ) : (
              <ImageBlockFields block={b} onPatch={(patch) => set(i, patch)} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ImageBlockFields({ block, onPatch }: { block: Extract<AboutBlock, { type: "image" }>; onPatch: (p: Partial<Extract<AboutBlock, { type: "image" }>>) => void }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start gap-3">
        {block.url ? (
          <img src={block.url} alt="" className="max-h-32 w-auto rounded-md border border-border/60" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-md border border-dashed border-border text-muted-foreground"><ImageIcon className="h-5 w-5" /></div>
        )}
        <div className="flex flex-col gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-accent/10">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? `Uploading… ${progress}%` : "Upload photo"}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/svg+xml" className="hidden" onChange={async (e) => {
              const file = e.target.files?.[0]; if (!file) return;
              setUploading(true); setProgress(0);
              const t = toast.loading("Uploading photo…");
              try {
                const u = await uploadMedia(file, { onProgress: setProgress });
                onPatch({ url: u });
                toast.success("Uploaded", { id: t });
              } catch (err) {
                toast.error((err as Error).message, { id: t });
              } finally {
                setUploading(false); setProgress(0); e.target.value = "";
              }
            }} />
          </label>
          {uploading && <Progress value={progress} className="w-48" />}
          <p className="max-w-xs text-[11px] text-muted-foreground">The photo keeps its own shape — nothing is cropped.</p>
        </div>
      </div>
      <Input value={block.url ?? ""} onChange={(e) => onPatch({ url: e.target.value })} placeholder="or paste image URL" />
      <Input value={block.caption ?? ""} onChange={(e) => onPatch({ caption: e.target.value })} placeholder="Caption (optional)" />
      <div className="flex flex-wrap gap-3">
        <label className="text-xs text-muted-foreground">
          Size
          <select
            value={block.width ?? "full"}
            onChange={(e) => onPatch({ width: e.target.value as "full" | "wide" | "half" })}
            className="ml-2 rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground"
          >
            <option value="full">Full width</option>
            <option value="wide">Wide (85%)</option>
            <option value="half">Half width</option>
          </select>
        </label>
        <label className="text-xs text-muted-foreground">
          Position
          <select
            value={block.align ?? "center"}
            onChange={(e) => onPatch({ align: e.target.value as "left" | "center" | "right" })}
            className="ml-2 rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground"
          >
            <option value="center">Centered</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </label>
      </div>
    </div>
  );
}
