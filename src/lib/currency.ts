import { useQuery } from "@tanstack/react-query";

const CUR_KEY = "mk_user_currency";
const RATES_KEY = "mk_rates_";

async function detectCurrency(): Promise<string> {
  if (typeof window === "undefined") return "TZS";
  const cached = window.localStorage.getItem(CUR_KEY);
  if (cached) return cached;
  try {
    const r = await fetch("https://ipapi.co/currency/", { cache: "no-store" });
    const text = (await r.text()).trim().toUpperCase();
    if (/^[A-Z]{3}$/.test(text)) {
      window.localStorage.setItem(CUR_KEY, text);
      return text;
    }
  } catch { /* ignore */ }
  return "TZS";
}

async function getRate(from: string, to: string): Promise<number> {
  if (from === to) return 1;
  const key = `${RATES_KEY}${from}_${to}`;
  if (typeof window !== "undefined") {
    const raw = window.localStorage.getItem(key);
    if (raw) {
      try {
        const { rate, ts } = JSON.parse(raw);
        if (Date.now() - ts < 12 * 60 * 60 * 1000) return rate;
      } catch { /* ignore */ }
    }
  }
  try {
    const r = await fetch(`https://open.er-api.com/v6/latest/${from}`);
    const j = await r.json();
    const rate = j?.rates?.[to];
    if (typeof rate === "number") {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify({ rate, ts: Date.now() }));
      }
      return rate;
    }
  } catch { /* ignore */ }
  return 1;
}

export function useLocalPrice(amount: number | undefined | null, baseCurrency: string | undefined) {
  const base = (baseCurrency || "TZS").toUpperCase();
  return useQuery({
    queryKey: ["local-price", base, amount],
    enabled: amount != null,
    staleTime: 12 * 60 * 60 * 1000,
    queryFn: async () => {
      const target = await detectCurrency();
      const rate = await getRate(base, target);
      const converted = (amount ?? 0) * rate;
      return {
        base,
        target,
        converted,
        formatted: formatMoney(converted, target),
        original: formatMoney(amount ?? 0, base),
        isConverted: target !== base,
      };
    },
  });
}

export function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: amount >= 100 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${Math.round(amount).toLocaleString()} ${currency}`;
  }
}
