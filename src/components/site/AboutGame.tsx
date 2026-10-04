import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Home, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import worldImage from "@/assets/about-game-world.jpg";
import characterImage from "@/assets/about-game-character.png";

export type AboutGameChapter = {
  year?: string;
  title: string;
  body: string;
  marker?: string;
};

export type AboutGameContent = {
  eyebrow?: string;
  title?: string;
  intro?: string;
  startLabel?: string;
  sceneImage?: string;
  chapters?: AboutGameChapter[] | string;
};

const DEFAULT_CHAPTERS: AboutGameChapter[] = [
  { year: "START", marker: "01", title: "Meet Melchizedeck", body: "A Tanzanian writer, screenwriter and youth advocate turning lived experience into stories that travel." },
  { year: "THE CRAFT", marker: "02", title: "Writing & Publishing", body: "Books, scripts, poetry and essays become places where African stories can be seen, questioned and remembered." },
  { year: "THE MISSION", marker: "03", title: "Youth Advocacy", body: "The journey grows through creating spaces where young people find their voice and act on their ideas." },
  { year: "THE WORK", marker: "04", title: "Leadership & Community", body: "Creative practice meets service through projects that connect communication, leadership and community action." },
  { year: "THE ROAD", marker: "05", title: "Milestones", body: "Every book, stage, school and collaboration becomes another chapter in a story still being written." },
  { year: "NEXT", marker: "06", title: "The Future Is Unwritten", body: "Keep exploring the archive, the projects and the ideas shaping what comes next." },
];

function parseChapters(value: AboutGameContent["chapters"]) {
  if (Array.isArray(value)) return value.filter((chapter) => chapter?.title && chapter?.body);
  if (typeof value !== "string" || !value.trim()) return DEFAULT_CHAPTERS;
  try {
    const parsed = JSON.parse(value) as AboutGameChapter[];
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_CHAPTERS;
  } catch {
    return DEFAULT_CHAPTERS;
  }
}

export function AboutGame({ content }: { content?: AboutGameContent }) {
  const chapters = parseChapters(content?.chapters);
  const [step, setStep] = useState(0);
  const [started, setStarted] = useState(false);
  const touchStart = useRef<number | null>(null);
  const wheelLocked = useRef(false);
  const sceneImage = content?.sceneImage?.trim() || worldImage;

  const move = useCallback((direction: number) => {
    setStarted(true);
    setStep((current) => Math.min(chapters.length - 1, Math.max(0, current + direction)));
  }, [chapters.length]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === " ") {
        event.preventDefault();
        move(1);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        move(-1);
      }
      if (event.key === "Home") {
        event.preventDefault();
        setStep(0);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move]);

  const progress = chapters.length > 1 ? step / (chapters.length - 1) : 0;

  return (
    <main
      className="game-shell relative isolate min-h-svh overflow-hidden bg-background text-foreground"
      onWheel={(event) => {
        if (Math.abs(event.deltaY) < 20 || wheelLocked.current) return;
        wheelLocked.current = true;
        move(event.deltaY > 0 ? 1 : -1);
        window.setTimeout(() => { wheelLocked.current = false; }, 650);
      }}
      onTouchStart={(event) => { touchStart.current = event.touches[0]?.clientX ?? null; }}
      onTouchEnd={(event) => {
        const start = touchStart.current;
        const end = event.changedTouches[0]?.clientX;
        touchStart.current = null;
        if (start === null || end === undefined || Math.abs(end - start) < 45) return;
        move(end < start ? 1 : -1);
      }}
    >
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <img
          src={sceneImage}
          alt=""
          width={1920}
          height={1024}
          loading="eager"
          fetchPriority="high"
          className="h-full w-full scale-110 object-cover transition-transform duration-1000 ease-out"
          style={{ transform: `scale(1.1) translateX(${(0.5 - progress) * 7}%)` }}
        />
        <div className="absolute inset-0 bg-game-veil" />
        <div className="absolute inset-x-0 bottom-0 h-[38%] bg-game-ground" />
      </div>

      <header className="relative z-30 flex items-center justify-between gap-3 px-4 py-4 sm:px-7">
        <Link to="/" aria-label="Home" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-cream/30 bg-background/75 text-cream backdrop-blur-md transition hover:border-gold hover:text-gold">
          <Home className="h-4 w-4" />
        </Link>
        <div className="flex rounded-md border border-cream/25 bg-background/75 p-1 text-xs font-medium backdrop-blur-md">
          <Link to="/about" className="rounded px-3 py-2 text-cream/70 transition hover:text-gold">Classic About</Link>
          <span className="rounded bg-gold px-3 py-2 text-primary-foreground">Game Mode</span>
        </div>
        <Button variant="outline" size="icon" className="border-cream/30 bg-background/75 text-cream backdrop-blur-md hover:text-gold" onClick={() => { setStep(0); setStarted(false); }} aria-label="Restart journey" title="Restart journey">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </header>

      <div className="relative z-10 flex min-h-[calc(100svh-72px)] flex-col justify-between">
        <div className="relative flex flex-1 items-center overflow-hidden">
          <div
            className="flex w-full transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:duration-0"
            style={{ transform: `translateX(-${step * 100}%)` }}
          >
            {chapters.map((chapter, index) => (
              <section key={`${chapter.title}-${index}`} className="flex w-full shrink-0 items-center px-5 pb-36 pt-8 sm:px-12 lg:px-[10vw]">
                <div className={`max-w-xl transition-all duration-700 ${step === index ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"}`}>
                  <div className="mb-4 flex items-center gap-3">
                    <span className="font-mono text-xs text-gold">{chapter.marker || String(index + 1).padStart(2, "0")}</span>
                    <span className="h-px w-10 bg-gold/60" />
                    <span className="text-xs font-accent uppercase tracking-[0.28em] text-cream/75">{chapter.year}</span>
                  </div>
                  {index === 0 && <p className="mb-3 text-xs font-accent uppercase tracking-[0.28em] text-gold">{content?.eyebrow || "An interactive story"}</p>}
                  <h1 className="max-w-[12ch] font-display text-4xl leading-[1.05] text-cream sm:text-6xl lg:text-7xl">{index === 0 ? content?.title || chapter.title : chapter.title}</h1>
                  <p className="mt-5 max-w-lg text-sm leading-7 text-cream/80 sm:text-base">{index === 0 && content?.intro ? content.intro : chapter.body}</p>
                  {index === chapters.length - 1 && (
                    <div className="mt-7 flex flex-wrap gap-3">
                      <Link to="/about" className="inline-flex items-center gap-2 rounded-md bg-gold px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"><BookOpen className="h-4 w-4" />Read the full story</Link>
                      <Link to="/projects" className="rounded-md border border-cream/40 bg-background/40 px-5 py-2.5 text-sm text-cream backdrop-blur transition hover:border-gold">Explore projects</Link>
                    </div>
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>

        <img
          src={characterImage}
          alt="Illustrated character of Melchizedeck Kakese"
          width={768}
          height={1024}
          loading="eager"
          className={`pointer-events-none absolute bottom-16 z-20 h-[32vh] min-h-56 w-auto object-contain drop-shadow-2xl transition-all duration-700 sm:bottom-12 sm:h-[48vh] ${started ? "game-character-walk" : ""}`}
          style={{ left: `clamp(58%, ${64 + progress * 20}%, 84%)`, transform: "translateX(-50%)" }}
        />

        {!started && (
          <button type="button" onClick={() => { setStarted(true); move(1); }} className="absolute bottom-28 left-1/2 z-30 -translate-x-1/2 rounded-md border border-gold/50 bg-background/80 px-5 py-3 text-sm font-medium text-cream shadow-xl backdrop-blur-md transition hover:bg-gold hover:text-primary-foreground sm:bottom-24">
            {content?.startLabel || "Start the journey"} <ArrowRight className="ml-2 inline h-4 w-4" />
          </button>
        )}

        <footer className="relative z-30 flex items-end justify-between gap-4 px-4 pb-5 sm:px-7 sm:pb-7">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.22em] text-cream/70">
              <span>Chapter {step + 1}</span><span>{chapters.length}</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-cream/20"><div className="h-full bg-gold transition-[width] duration-700" style={{ width: `${((step + 1) / chapters.length) * 100}%` }} /></div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="border-cream/30 bg-background/75 text-cream backdrop-blur-md hover:text-gold" disabled={step === 0} onClick={() => move(-1)} aria-label="Previous chapter"><ArrowLeft className="h-4 w-4" /></Button>
            <Button size="icon" className="bg-gold text-primary-foreground hover:opacity-90" disabled={step === chapters.length - 1} onClick={() => move(1)} aria-label="Next chapter"><ArrowRight className="h-4 w-4" /></Button>
          </div>
        </footer>
      </div>
    </main>
  );
}