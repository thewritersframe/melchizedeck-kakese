import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function ExpandableText({
  text,
  threshold = 240,
  className = "",
  moreHref,
}: {
  text: string;
  threshold?: number;
  className?: string;
  /** When set, "Read more" navigates to this page instead of expanding in place. */
  moreHref?: string;
}) {
  const [open, setOpen] = useState(false);
  const long = text.length > threshold;
  const shown = open || !long ? text : text.slice(0, threshold).replace(/\s+\S*$/, "") + "…";
  return (
    <div className={className}>
      <p className="whitespace-pre-wrap leading-relaxed">{shown}</p>
      {long &&
        (moreHref ? (
          <Link
            to={moreHref}
            className="mt-2 inline-block text-xs font-medium uppercase tracking-widest text-gold hover:opacity-80"
          >
            Read more
          </Link>
        ) : (
          <Button
            type="button"
            variant="link"
            size="sm"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="mt-2 h-auto p-0 text-xs font-medium uppercase tracking-widest text-gold hover:opacity-80"
          >
            {open ? "Show less" : "Read more"}
          </Button>
        ))}
    </div>
  );
}
