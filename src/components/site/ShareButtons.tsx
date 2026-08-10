import { useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";
import { toast } from "sonner";

type Props = {
  title: string;
  /** Path or hash appended to the site origin, e.g. "/blog#slug" */
  path?: string;
  text?: string;
};

function origin() {
  return typeof window === "undefined" ? "" : window.location.origin;
}

export function ShareButtons({ title, path = "/blog", text }: Props) {
  const [copied, setCopied] = useState(false);
  const url = `${origin()}${path}`;
  const share = text ? `${title} — ${text}` : title;

  async function nativeShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text: share, url });
        return;
      } catch {
        /* user cancelled */
      }
    }
    await copy();
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy the link");
    }
  }

  const targets = [
    { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${share} ${url}`)}` },
    { label: "X", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(share)}&url=${encodeURIComponent(url)}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
    { label: "Email", href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${share}\n\n${url}`)}` },
  ];

  return (
    <div className="mt-6 flex flex-wrap items-center gap-2">
      <button
        onClick={nativeShare}
        className="inline-flex items-center gap-2 rounded-full border border-gold/60 bg-gold/10 px-4 py-1.5 text-xs uppercase tracking-widest text-gold transition hover:bg-gold/20"
      >
        <Share2 className="h-3.5 w-3.5" /> Share
      </button>
      {targets.map((t) => (
        <a
          key={t.label}
          href={t.href}
          target="_blank"
          rel="noreferrer noopener"
          className="rounded-full border border-border/60 px-3 py-1.5 text-xs uppercase tracking-widest text-muted-foreground transition hover:border-gold/60 hover:text-cream"
        >
          {t.label}
        </a>
      ))}
      <button
        onClick={copy}
        aria-label="Copy link"
        className="inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1.5 text-xs uppercase tracking-widest text-muted-foreground transition hover:border-gold/60 hover:text-cream"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />} {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
