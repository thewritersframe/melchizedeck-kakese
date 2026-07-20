import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useSection, useCollection, type ContentItem } from "@/lib/cms";
import { SmartImage } from "@/components/site/SmartImage";
import { useUnlockEmail, useUnlocks, isItemLocked } from "@/lib/locks";
import { UnlockDialog } from "@/components/site/UnlockDialog";
import { AccessBar } from "@/components/site/AccessBar";
import { Lock, Unlock, Gift, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { claimBundlePick } from "@/lib/payments.functions";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/books")({
  head: () => ({ meta: [{ title: "Books — Melchizedeck Kakese" }, { name: "description", content: "Books by Melchizedeck Kakese." }] }),
  component: Books,
});

function usePricing() {
  return useQuery({
    queryKey: ["site-settings", "payments"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("value").eq("key", "payments").maybeSingle();
      return (data?.value ?? {}) as { standard_price?: number; currency?: string; bundle_free_picks?: number };
    },
  });
}

function Books() {
  const { data: header } = useSection<{ title: string; body: string }>("books", "header");
  const { data: items } = useCollection("book");
  const [email] = useUnlockEmail();
  const { data: unlocks } = useUnlocks(email);
  const { data: pricing } = usePricing();
  const [openItem, setOpenItem] = useState<ContentItem | null>(null);
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
          <h1 className="font-serif text-5xl text-cream">{h?.title ?? "Books"}</h1>
          <p className="mt-4 text-muted-foreground">{h?.body}</p>
        </div>
        <div className="mt-8"><AccessBar bundleExpiresAt={unlocks?.bundleExpiresAt ?? null} /></div>
        <div className="mt-6 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {items?.map((b) => {
            const locked = isItemLocked(b.meta) && !unlockedIds.has(b.id);
            return (
              <article key={b.id} className="group relative rounded-xl border border-border/60 bg-card/60 p-5 backdrop-blur">
                <div className="relative flex min-h-[16rem] w-full items-center justify-center overflow-hidden rounded-md border border-border/60 bg-background p-2">
                  <SmartImage
                    src={b.image_url}
                    alt={b.title}
                    loading="lazy"
                    fallbackLabel={b.title}
                    className={`max-h-[28rem] w-auto max-w-full object-contain transition-transform duration-500 group-hover:scale-[1.03] ${locked ? "blur-md" : ""}`}
                    wrapperClassName="flex items-center justify-center"
                  />
                  {locked && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40">
                      <Lock className="h-8 w-8 text-gold" />
                    </div>
                  )}
                </div>
                <h2 className="mt-5 font-serif text-2xl text-cream">{b.title}</h2>
                {b.subtitle && <p className="mt-1 text-sm text-gold/80">{b.subtitle}</p>}
                {b.body && (
                  <p className={`mt-3 line-clamp-4 text-sm text-muted-foreground ${locked ? "line-clamp-2 italic opacity-70" : ""}`}>
                    {locked ? b.body.split("\n")[0].slice(0, 140) + "…" : b.body}
                  </p>
                )}
                {locked ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" className="bg-gold text-primary-foreground hover:opacity-90" onClick={() => setOpenItem(b)}>
                      <Lock className="mr-1 h-3.5 w-3.5" /> Unlock
                    </Button>
                    {bundleActive && email && (
                      <Button size="sm" variant="outline" disabled={claimMut.isPending} onClick={() => claimMut.mutate(b.id)}>
                        {claimMut.isPending ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Gift className="mr-1 h-3.5 w-3.5" />} Use free pick
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    {isItemLocked(b.meta) && (
                      <p className="mt-3 inline-flex items-center gap-1 text-xs text-gold"><Unlock className="h-3.5 w-3.5" /> Unlocked</p>
                    )}
                    {(b.meta as { buy_url?: string })?.buy_url && (
                      <a href={(b.meta as { buy_url?: string }).buy_url} target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm text-gold hover:underline">
                        Get the book →
                      </a>
                    )}
                  </>
                )}
              </article>
            );
          })}
          {items?.length === 0 && <p className="text-muted-foreground">No books yet.</p>}
        </div>
      </section>
      {openItem && <UnlockDialog item={openItem} onClose={() => setOpenItem(null)} price={pricing} />}
    </SiteLayout>
  );
}
