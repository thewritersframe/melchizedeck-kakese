import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function ExpandableText({
  text,
  threshold = 240,
  className = "",
  moreHref,
  preserveLineBreaks = false,
}: {
  text: string;
  threshold?: number;
  className?: string;
  preserveLineBreaks?: boolean;
  /** When set, "Read more" navigates to this page instead of expanding in place. */
  moreHref?: "/events" | "/advocacy" | "/projects" | "/about" | "/blog" | "/books" | "/scripts" | "/speeches" | "/contact";
}) {
  const [open, setOpen] = useState(false);
  const long = text.length > threshold;
  const shown = open || !long ? text : text.slice(0, threshold).replace(/\s+\S*$/, "") + "…";
  return (
    <div className={className}>
      <div className={preserveLineBreaks ? "poetry whitespace-pre-wrap leading-relaxed" : "space-y-4 leading-relaxed"}>
        {preserveLineBreaks ? shown : shown.split(/\n\s*\n/).map((paragraph, i) => <p key={i}>{paragraph}</p>)}
      </div>
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
