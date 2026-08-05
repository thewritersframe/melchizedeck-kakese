import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Heart, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useSection } from "@/lib/cms";
import { useSiteSettings } from "@/lib/settings";
import { startDonation } from "@/lib/donations.functions";
import { PriceTag } from "@/components/site/PriceTag";
import { SelcomPayPanel, type PayInstructions } from "@/components/site/SelcomPayPanel";

type SupportContent = {
  eyebrow?: string;
  title?: string;
  body?: string;
  amounts?: string;
  buttonLabel?: string;
  note?: string;
};

const DEFAULTS: SupportContent = {
  eyebrow: "Support the Work",
  title: "Support My Vision",
  body:
    "Every book written, screenplay developed, and young person mentored is funded by people who believe stories can change a continent. Your contribution keeps this work moving.",
  amounts: "5000, 10000, 25000, 50000",
  buttonLabel: "Contribute",
  note: "Secure mobile money and card payments via Selcom (M-Pesa, Tigo Pesa, Airtel Money, Halopesa, Visa & Mastercard).",
};

export function SupportVision() {
  const { data: section } = useSection<SupportContent>("site", "support");
  const { data: pay } = useSiteSettings("payments");
  const c = { ...DEFAULTS, ...(section?.content ?? {}) };
  const currency = String((pay as { currency?: string } | undefined)?.currency ?? "TZS");

  const presets = String(c.amounts ?? "")
    .split(/[,\n]/)
    .map((s) => Number(String(s).replace(/[^0-9.]/g, "")))
    .filter((n) => Number.isFinite(n) && n > 0);

  const [amount, setAmount] = useState<number | null>(presets[1] ?? presets[0] ?? null);
  const [custom, setCustom] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [manual, setManual] = useState<PayInstructions | null>(null);

  const donate = useServerFn(startDonation);
  const start = useMutation({
    mutationFn: async () => {
      const chosen = custom.trim() ? Number(custom.replace(/[^0-9.]/g, "")) : amount;
      if (!chosen || chosen <= 0) throw new Error("Choose or enter an amount");
      if (!email.includes("@")) throw new Error("Enter a valid email so we can send your receipt");
      return await donate({
        data: { name, email, phone, amount: chosen, message },
      });
    },
    onSuccess: (res) => {
      if (res?.checkoutUrl) {
        toast.success("Redirecting to secure checkout…");
        window.location.href = res.checkoutUrl;
      } else if (res?.manual && (res.manual.payLink || res.manual.qrPayload)) {
        setManual({
          orderRef: res.orderRef,
          amount: Number(res.amount),
          currency: res.currency,
          ...res.manual,
        });
      } else {
        toast.error("Could not open checkout. Please try again.");
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const effective = custom.trim() ? Number(custom.replace(/[^0-9.]/g, "")) : amount;

  return (
    <section id="support" className="mx-auto max-w-5xl px-6 py-20">
      <div className="overflow-hidden rounded-2xl border border-gold/25 bg-card/60 p-8 backdrop-blur md:p-12">
        <div className="grid gap-10 md:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold/80">
              <Heart className="h-3.5 w-3.5" /> {c.eyebrow}
            </p>
            <h2 className="mt-4 font-serif text-4xl text-cream">{c.title}</h2>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{c.body}</p>
            {c.note && <p className="mt-6 text-xs text-muted-foreground/80">{c.note}</p>}
          </div>

          <div>
            {manual ? (
              <div className="rounded-lg border border-gold/25 bg-card/60 p-4">
                <SelcomPayPanel info={manual} />
                <Button variant="outline" className="mt-4 w-full" onClick={() => setManual(null)}>
                  Make another contribution
                </Button>
              </div>
            ) : (
            <>
            {presets.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {presets.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => { setAmount(p); setCustom(""); }}
                    className={`rounded-md border px-3 py-2 text-sm transition ${
                      !custom.trim() && amount === p
                        ? "border-gold bg-gold/15 text-gold"
                        : "border-border/60 text-muted-foreground hover:text-gold"
                    }`}
                  >
                    {p.toLocaleString()} {currency}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4 space-y-3">
              <Input
                inputMode="numeric"
                placeholder={`Other amount (${currency})`}
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
              />
              <Input placeholder="Your name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
              <Input type="email" placeholder="Email (for your receipt)" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input placeholder="Phone (mobile money number)" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <Textarea
                rows={2}
                placeholder="Leave a message (optional)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            {effective ? (
              <div className="mt-4">
                <PriceTag amount={effective} currency={currency} />
              </div>
            ) : null}

            <Button
              className="mt-5 w-full bg-gold text-primary-foreground hover:opacity-90"
              disabled={start.isPending}
              onClick={() => start.mutate()}
            >
              {start.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Opening checkout…</> : c.buttonLabel}
            </Button>
            </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
