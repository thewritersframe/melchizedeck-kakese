import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";

type Moment = {
  id: number;
  title: string;
  location: string;
  date: string;
  description: string;
  image: string;
};

const moments: Moment[] = [
  {
    id: 1,
    title: "Youth World Festival 2026",
    location: "Ekaterinburg, Russia",
    date: "2026",
    description: "A new chapter in the journey.",
    image: "/images/moments/wyf-2026.jpg",
  },
  {
    id: 2,
    title: "Writer's Frame",
    location: "Dar es Salaam, Tanzania",
    date: "2026",
    description: "Creating spaces where young voices can be heard.",
    image: "/images/moments/writers-frame.jpg",
  },
  {
    id: 3,
    title: "St. Therese Alumni",
    location: "Dar es Salaam, Tanzania",
    date: "2026",
    description: "Returning to where part of the story began.",
    image: "/images/moments/st-therese.jpg",
  },
];

export default function MomentsSlideshow() {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);

  const next = () => {
    setCurrent((prev) => (prev + 1) % moments.length);
  };

  const previous = () => {
    setCurrent((prev) =>
      prev === 0 ? moments.length - 1 : prev - 1
    );
  };

  useEffect(() => {
    if (!playing) return;

    const timer = setInterval(next, 6000);

    return () => clearInterval(timer);
  }, [playing]);

  const moment = moments[current];

  return (
    <section className="relative w-full overflow-hidden bg-black text-white">
      <div className="relative min-h-[650px]">

        {/* Background image */}
        <img
          src={moment.image}
          alt={moment.title}
          className="absolute inset-0 h-full w-full bg-muted object-contain transition-opacity duration-700"
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Content */}
        <div className="relative z-10 flex min-h-[650px] items-end">
          <div className="w-full p-8 md:p-16 lg:p-24">

            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-white/70">
              Moments
            </p>

            <h2 className="max-w-3xl text-4xl font-bold md:text-6xl">
              {moment.title}
            </h2>

            <p className="mt-4 text-lg text-white/80">
              {moment.location} · {moment.date}
            </p>

            <p className="mt-3 max-w-xl text-white/80">
              {moment.description}
            </p>

            {/* Controls */}
            <div className="mt-8 flex items-center gap-3">

              <button
                onClick={previous}
                className="rounded-full border border-white/30 p-3 transition hover:bg-white hover:text-black"
                aria-label="Previous moment"
              >
                <ChevronLeft size={20} />
              </button>

              <button
                onClick={() => setPlaying(!playing)}
                className="rounded-full border border-white/30 p-3 transition hover:bg-white hover:text-black"
                aria-label={playing ? "Pause slideshow" : "Play slideshow"}
              >
                {playing ? <Pause size={20} /> : <Play size={20} />}
              </button>

              <button
                onClick={next}
                className="rounded-full border border-white/30 p-3 transition hover:bg-white hover:text-black"
                aria-label="Next moment"
              >
                <ChevronRight size={20} />
              </button>

              <span className="ml-4 text-sm text-white/60">
                {String(current + 1).padStart(2, "0")} /{" "}
                {String(moments.length).padStart(2, "0")}
              </span>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
