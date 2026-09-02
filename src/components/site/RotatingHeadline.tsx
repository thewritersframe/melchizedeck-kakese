import { useEffect, useState } from "react";

const PHRASES = [
  "MELCHIZEDECK KAKESE",
  "A YOUTH ADVOCATE",
  "A CREATIVE WRITER",
  "THE FOUNDER OF THE WRITER'S FRAME",
];

export function RotatingHeadline() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"in" | "out">("in");

  useEffect(() => {
    const outTimer = setTimeout(() => setPhase("out"), 2400);
    const swapTimer = setTimeout(() => {
      setIndex((i) => (i + 1) % PHRASES.length);
      setPhase("in");
    }, 2900);
    return () => {
      clearTimeout(outTimer);
      clearTimeout(swapTimer);
    };
  }, [index]);

  return (
    <div className="mt-6 w-full">
      <h1 className="font-serif text-4xl leading-tight text-cream md:text-6xl">
        I am
      </h1>
      <div
        className="relative mt-3 flex min-h-[4.5rem] w-full items-start justify-center overflow-hidden md:min-h-[7rem]"
        aria-live="polite"
      >
        <span
          key={index}
          className={
            "block w-full max-w-full break-words px-2 text-center font-serif text-2xl uppercase leading-tight tracking-wide text-gold transition-all duration-500 ease-out sm:text-3xl md:text-5xl " +
            (phase === "in"
              ? "translate-y-0 opacity-100"
              : "-translate-y-6 opacity-0")
          }
          style={phase === "in" ? { animation: "none" } : undefined}
        >
          {PHRASES[index]}
        </span>
      </div>
    </div>
  );
}
