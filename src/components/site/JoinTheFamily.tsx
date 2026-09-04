import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Instagram, Facebook, Linkedin, AtSign, MessageCircle } from "lucide-react";
import type { ReactNode } from "react";
import { NewsletterForm } from "@/components/site/NewsletterForm";
import { useSection } from "@/lib/cms";
import { getSocialFollowers, type SocialCounts } from "@/lib/social.functions";

type Community = {
  eyebrow?: string;
  title?: string;
  body?: string;
} & Partial<Record<keyof SocialCounts, number | string>>;

type Links = Partial<Record<keyof SocialCounts, string>>;

const PLATFORMS: { key: keyof SocialCounts; label: string; icon: ReactNode }[] = [
  { key: "instagram", label: "Instagram", icon: <Instagram className="h-4 w-4" /> },
  { key: "linkedin", label: "LinkedIn", icon: <Linkedin className="h-4 w-4" /> },
  { key: "facebook", label: "Facebook", icon: <Facebook className="h-4 w-4" /> },
  { key: "threads", label: "Threads", icon: <AtSign className="h-4 w-4" /> },
  { key: "whatsapp", label: "WhatsApp", icon: <MessageCircle className="h-4 w-4" /> },
];

const DEFAULT_COUNTS: SocialCounts = {
  instagram: 1155,
  linkedin: 822,
  facebook: 430,
  threads: 229,
  whatsapp: 23,
};

export function JoinTheFamily({ links }: { links: Links }) {
  const { data: section } = useSection<Community>("site", "community");
  const c = section?.content ?? {};
  const baseline = {
    instagram: c.instagram ?? DEFAULT_COUNTS.instagram,
    linkedin: c.linkedin ?? DEFAULT_COUNTS.linkedin,
    facebook: c.facebook ?? DEFAULT_COUNTS.facebook,
    threads: c.threads ?? DEFAULT_COUNTS.threads,
    whatsapp: c.whatsapp ?? DEFAULT_COUNTS.whatsapp,
  };
  const fetchFollowers = useServerFn(getSocialFollowers);
  const { data: followers } = useQuery({
    queryKey: ["social-followers", baseline],
    queryFn: () => fetchFollowers({ data: { baseline } }),
    staleTime: 30 * 60 * 1000,
  });

  const counts = followers?.counts;
  const total = followers?.total ?? 0;
  const fmt = (n: number) => n.toLocaleString();

  return (
    <div className="border-b border-border/40 pb-10">
      <div className="grid gap-10 md:grid-cols-2 md:items-center">
        <div>
          <p className="text-xs font-accent uppercase tracking-[0.3em] text-gold">
            {c.eyebrow ?? "Join the family"}
          </p>
          <h2 className="mt-3 font-serif text-3xl text-foreground md:text-4xl">
            {c.title ?? "JOIN THE FAMILY"}
          </h2>
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted-foreground">
            {c.body ??
              "Come along for the journey — new books, screenplays, essays and behind-the-scenes stories, straight to your inbox."}
          </p>

          <div className="mt-6 md:max-w-md">
            <NewsletterForm />
          </div>
        </div>

        <div className="rounded-xl border border-gold/25 bg-card/70 p-6">
          <p className="text-xs font-accent uppercase tracking-[0.3em] text-gold">Our community</p>
          <p className="mt-2 font-serif text-4xl text-foreground md:text-5xl">
            {total ? fmt(total) : "—"}
          </p>
          <p className="text-xs text-muted-foreground">followers across all platforms</p>

          <ul className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {PLATFORMS.map((p) => (
              <li
                key={p.key}
                className="flex items-center justify-between gap-2 rounded-md border border-border/50 px-2.5 py-1.5 text-xs text-muted-foreground"
              >
                <span className="flex items-center gap-1.5 text-cream">{p.icon}</span>
                <span className="tabular-nums text-foreground">
                  {counts ? fmt(counts[p.key] ?? 0) : "—"}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {PLATFORMS.filter((p) => links[p.key]).map((p) => (
              <a
                key={p.key}
                href={links[p.key]!}
                target="_blank"
                rel="noreferrer"
                aria-label={p.label}
                title={p.label}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 text-cream transition hover:border-gold/60 hover:text-gold"
              >
                {p.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
