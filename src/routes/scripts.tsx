import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useSection, useCollection, type ContentItem } from "@/lib/cms";
import { SmartImage } from "@/components/site/SmartImage";
import { useUnlockEmail, useUnlocks, isItemLocked } from "@/lib/locks";
import { UnlockDialog } from "@/components/site/UnlockDialog";
import { ExpandableText } from "@/components/site/ExpandableText";
import { BookOpen, Lock, Unlock, Gift, Loader2, X, FileText } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { claimBundlePick } from "@/lib/payments.functions";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Header = { title: string; body: string };

export const Route = createFileRoute("/scripts")({
  head: () => ({ meta: [{ title: "Scripts — Melchizedeck Kakese" }, { name: "description", content: "Screenplays and teleplays." }] }),
  component: Scripts,
});

function SynopsisDialog({ item, onClose }: { item: ContentItem; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl border border-border/60 bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 text-gold"><BookOpen className="h-5 w-5" /><span className="text-xs uppercase tracking-widest">Synopsis</span></div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>
        <h3 className="mt-3 font-serif text-2xl text-cream">{item.title}</h3>
        {item.subtitle && <p className="mt-1 text-sm text-gold/80">{item.subtitle}</p>}
        <div className="mt-4 max-h-[60vh] overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
          {item.body || "No synopsis available yet."}
        </div>
      </div>
    </div>
  );
}

function Scripts() {
  const { data: header } = useSection<Header>("scripts", "header");
  const { data: items } = useCollection("script");
  const [email] = useUnlockEmail();
  const { data: unlocks } = useUnlocks(email);
  const { data: pricing } = useQuery({
    queryKey: ["site-settings", "payments"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("value").eq("key", "payments").maybeSingle();
      return (data?.value ?? {}) as { standard_price?: number; currency?: string };
    },
  });
  const [synopsisItem, setSynopsisItem] = useState<ContentItem | null>(null);
  const [unlockItem, setUnlockItem] = useState<ContentItem | null>(null);
  const qc = useQueryClient();
  const claim = useServerFn(claimBundlePick);
  const claimMut = useMutation({
    mutationFn: async (id: string) => claim({ data: { email, itemId: id } }),
    onSuccess: () => { toast.success("Free pick claimed!"); qc.invalidateQueries({ queryKey: ["unlocks", email] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const unlockedIds = new Set(unlocks?.itemIds ?? []);
  const bundleActive = !!unlocks?.bundleExpiresAt;
  const h = header?.content;

  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Screenwriting</p>
          <h1 className="mt-3 font-serif text-5xl text-cream">{h?.title}</h1>
          <p className="mt-4 text-muted-foreground">{h?.body}</p>
        </div>
        <div className="mt-6 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {items?.map((it: ContentItem) => {
            const treatmentLocked = isItemLocked(it.meta) && !unlockedIds.has(it.id);
            const m = (it.meta ?? {}) as { genre?: string; status?: string; request_url?: string; request_email?: string };
            const requestHref = m.request_url ?? (m.request_email ? `mailto:${m.request_email}?subject=${encodeURIComponent(`Screenplay treatment request: ${it.title}`)}` : "/contact");
            return (
              <article key={it.id} className="overflow-hidden rounded-xl border border-border/60 bg-card/60 backdrop-blur">
                {it.image_url && (
                  <div className="relative flex min-h-[14rem] items-center justify-center overflow-hidden bg-background/60 p-2">
                    <SmartImage
                      src={it.image_url}
                      alt={it.title}
                      loading="lazy"
                      fallbackLabel={it.title}
                      className="max-h-[28rem] w-auto max-w-full object-contain"
                      wrapperClassName="flex items-center justify-center"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-widest">
                    {m.genre && <span className="text-gold">{m.genre}</span>}
                    {m.genre && m.status && <span className="text-muted-foreground/60">·</span>}
                    {m.status && <span className="text-muted-foreground">{m.status}</span>}
                  </div>
                  <h2 className="mt-2 font-serif text-xl text-cream">{it.title}</h2>
                  {it.subtitle && <p className="mt-1 text-sm text-gold/80">{it.subtitle}</p>}
                  {it.body && (
                    <>
                      <p className="mt-3 text-[11px] uppercase tracking-widest text-muted-foreground/70">Logline</p>
                      <ExpandableText text={it.body} className="mt-1 text-sm text-muted-foreground" />
                    </>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => setSynopsisItem(it)}>
                      <BookOpen className="mr-1 h-3.5 w-3.5" /> Read Synopsis
                    </Button>
                    {treatmentLocked ? (
                      <>
                        <Button size="sm" className="bg-gold text-primary-foreground hover:opacity-90" onClick={() => setUnlockItem(it)}>
                          <Lock className="mr-1 h-3.5 w-3.5" /> Request Screenplay Treatment
                        </Button>
                        {bundleActive && email && (
                          <Button size="sm" variant="outline" disabled={claimMut.isPending} onClick={() => claimMut.mutate(it.id)}>
                            {claimMut.isPending ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Gift className="mr-1 h-3.5 w-3.5" />} Use free pick
                          </Button>
                        )}
                      </>
                    ) : (
                      <>
                        {isItemLocked(it.meta) && <span className="inline-flex items-center gap-1 text-xs text-gold"><Unlock className="h-3.5 w-3.5" /> Unlocked</span>}
                        <a href={requestHref} className="inline-flex items-center rounded-md bg-gold px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90">
                          <FileText className="mr-1 h-3.5 w-3.5" /> Request Screenplay Treatment
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
          {items?.length === 0 && <p className="text-muted-foreground">Nothing here yet — check back soon.</p>}
        </div>
      </section>
      {synopsisItem && <SynopsisDialog item={synopsisItem} onClose={() => setSynopsisItem(null)} />}
      {unlockItem && <UnlockDialog item={unlockItem} onClose={() => setUnlockItem(null)} price={pricing} />}
    </SiteLayout>
  );
}
