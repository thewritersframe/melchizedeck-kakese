import { useLocalPrice } from "@/lib/currency";

export function PriceTag({ amount, currency, className = "" }: { amount: number | null | undefined; currency: string | undefined; className?: string }) {
  const { data } = useLocalPrice(amount, currency);
  if (amount == null) return null;
  const primary = data?.formatted ?? `${(amount ?? 0).toLocaleString()} ${currency ?? "TZS"}`;
  return (
    <span className={`inline-flex items-baseline gap-1.5 rounded-md border border-gold/40 bg-gold/10 px-2 py-1 text-xs font-medium text-gold ${className}`}>
      <span>{primary}</span>
      {data?.isConverted && (
        <span className="text-[10px] text-gold/60">≈ {data.original}</span>
      )}
    </span>
  );
}
