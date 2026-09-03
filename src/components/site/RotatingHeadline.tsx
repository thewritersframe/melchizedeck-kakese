import { useEffect, useState } from "react";

const DEFAULT_PHRASES = [
  "MELCHIZEDECK KAKESE",
  "A YOUTH ADVOCATE",
  "A CREATIVE WRITER",
  "THE FOUNDER OF THE WRITER'S FRAME",
];

export function RotatingHeadline({
  prefix = "I am",
  phrases,
}: {
  prefix?: string;
  phrases?: string[];
}) {
  const list = (phrases ?? []).filter((p) => String(p ?? "").trim().length > 0);
  const items = list.length ? list : DEFAULT_PHRASES;

  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    setIndex(0);
    setLeaving(false);
  }, [items.join("|")]);

  useEffect(() => {
    if (items.length < 2) return;
    const outTimer = setTimeout(() => setLeaving(true), 2400);
    const swapTimer = setTimeout(() => {
      setIndex((i) => (i + 1) % items.length);
      setLeaving(false);
    }, 2900);
    return () => {
      clearTimeout(outTimer);
      clearTimeout(swapTimer);
    };
  }, [index, items.length]);

  return (
    <div className="w-full">
      <h1 className="mt-6 font-serif text-4xl leading-tight text-cream md:text-6xl">
        {prefix}
      </h1>
      <div
        className="relative mt-3 flex min-h-[4.5rem] w-full items-start justify-center overflow-hidden md:min-h-[7rem]"
        aria-live="polite"
      >
        <span
          key={index}
          className="block w-full max-w-full break-words px-2 text-center font-serif text-2xl uppercase leading-tight tracking-wide text-gold sm:text-3xl md:text-5xl"
          style={{
            animation: leaving
              ? "hero-phrase-out 500ms ease-in forwards"
              : "hero-phrase-in 500ms ease-out both",
          }}
        >
          {items[index % items.length]}
        </span>
      </div>
    </div>
  );
}
