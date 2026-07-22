import { useState } from "react";

export function ExpandableText({ text, threshold = 240, className = "" }: { text: string; threshold?: number; className?: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > threshold;
  const shown = open || !long ? text : text.slice(0, threshold).replace(/\s+\S*$/, "") + "…";
  return (
    <div className={className}>
      <p className="whitespace-pre-wrap leading-relaxed">{shown}</p>
      {long && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="mt-2 text-xs font-medium uppercase tracking-widest text-gold hover:opacity-80"
        >
          {open ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}
