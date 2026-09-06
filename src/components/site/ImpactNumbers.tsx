import { useEffect, useRef, useState } from "react";
import { useSection, type PageSection } from "@/lib/cms";

type Stat = { label: string; value: string | number; suffix?: string; prefix?: string };
export type Impact = { eyebrow?: string; title?: string; note?: string; items?: Stat[] };

const DEFAULTS: Stat[] = [
  { label: "Young people reached", value: 12000, suffix: "+" },
  { label: "Schools worked with", value: 45, suffix: "+" },
  { label: "Books published", value: 4 },
  { label: "Projects founded", value: 6 },
  { label: "Countries & events", value: 9, suffix: "+" },
];

function useInView<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    if (typeof IntersectionObserver === "undefined") { setInView(true); return; }
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setInView(true)),
      { threshold: 0.25 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [inView]);
  return { ref, inView };
}

function Counter({ target, run }: { target: number; run: boolean }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!run) return;
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce || target <= 0) { setValue(target); return; }
    const duration = 1600;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, target]);
  return <>{value.toLocaleString()}</>;
}

export function ImpactNumbers({ initialData }: { initialData?: PageSection<Impact> | null } = {}) {
  const { data } = useSection<Impact>("home", "impact", {
    ...(initialData !== undefined ? { initialData } : {}),
  });
  const c = data?.content;
  const items = (Array.isArray(c?.items) && c.items.length ? c.items : DEFAULTS).slice(0, 8);
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <section className="border-t border-border/40 bg-background/80 py-20">
      <div className="mx-auto max-w-6xl px-6" ref={ref}>
        <p className="text-center text-xs font-accent uppercase tracking-[0.3em] text-gold">{c?.eyebrow ?? "Impact"}</p>
        <h2 className="mt-3 text-center font-serif text-4xl text-foreground">{c?.title ?? "Impact in Numbers"}</h2>

        <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((s, i) => {
            const num = Number(String(s.value ?? "").replace(/[^0-9.]/g, "")) || 0;
            return (
              <div key={i} className="rounded-xl border border-border/60 bg-card/70 p-6 text-center shadow-sm">
                <div className="font-serif text-3xl text-gold md:text-4xl">
                  {s.prefix ?? ""}
                  <Counter target={num} run={inView} />
                  {s.suffix ?? ""}
                </div>
                <p className="mt-3 text-xs uppercase tracking-[0.15em] text-muted-foreground">{s.label}</p>
              </div>
            );
          })}
        </div>

        {c?.note && <p className="mt-8 text-center text-xs text-muted-foreground/80">{c.note}</p>}
      </div>
    </section>
  );
}
