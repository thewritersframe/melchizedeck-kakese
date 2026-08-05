import { useEffect, useState } from "react";
import { ExternalLink, Copy, Check, QrCode } from "lucide-react";
import { toast } from "sonner";

export type PayInstructions = {
  orderRef: string;
  amount: number;
  currency: string;
  payLink?: string | null;
  tillNumber?: string | null;
  merchantName?: string | null;
  qrPayload?: string | null;
};

/**
 * Shown when a payment must be completed on the merchant's Selcom / TIPS
 * payment page (link, till number or scannable QR) instead of a hosted
 * checkout session.
 */
export function SelcomPayPanel({ info }: { info: PayInstructions }) {
  const [qr, setQr] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!info.qrPayload) return;
    let cancelled = false;
    void (async () => {
      try {
        const QRCode = (await import("qrcode")).default;
        const url = await QRCode.toDataURL(info.qrPayload!, {
          width: 320,
          margin: 1,
          color: { dark: "#111111", light: "#ffffff" },
        });
        if (!cancelled) setQr(url);
      } catch {
        /* QR is optional */
      }
    })();
    return () => { cancelled = true; };
  }, [info.qrPayload]);

  const copy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      toast.success(`${label} copied`);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      toast.error("Could not copy — please select and copy manually");
    }
  };

  return (
    <div className="space-y-4 text-left">
      <div className="rounded-lg border border-gold/30 bg-gold/5 p-4">
        <p className="text-xs uppercase tracking-widest text-gold/80">Amount to pay</p>
        <p className="mt-1 font-serif text-2xl text-cream">
          {info.amount.toLocaleString()} {info.currency}
        </p>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Reference <span className="text-gold">{info.orderRef}</span>
          {info.merchantName ? ` · Paying ${info.merchantName}` : ""}
        </p>
      </div>

      {qr && (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-border/60 bg-card p-4">
          <img src={qr} alt="Scan to pay with any Tanzanian mobile banking or wallet app" className="h-40 w-40 rounded bg-white p-1" />
          <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <QrCode className="h-3.5 w-3.5" /> Scan with M-Pesa, Mixx by Yas, Airtel Money, HaloPesa or your bank app
          </p>
        </div>
      )}

      <div className="grid gap-2">
        {info.payLink && (
          <a
            href={info.payLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md bg-gold px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <ExternalLink className="mr-2 h-4 w-4" /> Pay now
          </a>
        )}
        {info.tillNumber && (
          <button
            type="button"
            onClick={() => copy("Till number", info.tillNumber!)}
            className="inline-flex items-center justify-between rounded-md border border-border/60 px-4 py-2.5 text-sm text-cream hover:border-gold/60"
          >
            <span>Selcom till / Lipa number: <span className="text-gold">{info.tillNumber}</span></span>
            {copied === "Till number" ? <Check className="h-4 w-4 text-gold" /> : <Copy className="h-4 w-4" />}
          </button>
        )}
        <button
          type="button"
          onClick={() => copy("Reference", info.orderRef)}
          className="inline-flex items-center justify-between rounded-md border border-border/60 px-4 py-2.5 text-sm text-cream hover:border-gold/60"
        >
          <span>Copy reference for the payment note</span>
          {copied === "Reference" ? <Check className="h-4 w-4 text-gold" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        After paying, keep your SMS confirmation. Access is confirmed automatically once the
        payment clears; if it takes longer than a few minutes, reply to your receipt email with
        the reference above.
      </p>
    </div>
  );
}
