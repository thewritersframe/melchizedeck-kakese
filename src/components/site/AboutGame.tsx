import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Home, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

type Level = { name: string; subtitle: string; story: string; accent: string; sky: string; ground: string; goal: string };
const LEVELS: Level[] = [
  { name: "The Beginning", subtitle: "Tanzania → Malawi", story: "Every journey starts somewhere. Curiosity, education and the courage to cross borders helped shape the writer and advocate I am becoming.", accent: "#ffd166", sky: "#f6a85c", ground: "#245b51", goal: "Reach the school gate" },
  { name: "The Writer", subtitle: "Ideas become stories", story: "Poetry, books, screenplays and essays became ways to explore the world and make room for African stories to travel farther.", accent: "#ffcf70", sky: "#9a8be8", ground: "#334c76", goal: "Collect the story pages" },
  { name: "The Advocate", subtitle: "The Writer’s Frame", story: "The mission grew beyond the page: helping children and young people build confidence through writing, storytelling, leadership and public speaking.", accent: "#ffe08a", sky: "#58b8c8", ground: "#286a5d", goal: "Bring the ideas to the world" },
  { name: "The World Stage", subtitle: "A wider horizon", story: "International youth experiences brought new friendships, ambitious project ideas and a stronger belief that young people can help shape their communities.", accent: "#ffd166", sky: "#607ecb", ground: "#34496f", goal: "Reach the horizon" },
];

type Game = { x: number; y: number; vx: number; vy: number; grounded: boolean; camera: number; collected: Set<number>; level: number; won: boolean; time: number };
type Item = { x: number; y: number; type: "star" | "book"; taken: boolean };
type Platform = { x: number; y: number; w: number; h: number };

function worldFor(level: number) {
  const platforms: Platform[] = [{ x: 0, y: 0, w: 430, h: 90 }];
  for (let i = 1; i < 17; i++) {
    const x = i * 245;
    const y = 355 - ((i * 71 + level * 37) % 4) * 48;
    platforms.push({ x, y, w: 145 + ((i * 19) % 55), h: 22 });
    if (i % 3 === 0) platforms.push({ x: x + 95, y: y + 65, w: 125, h: 22 });
  }
  platforms.push({ x: 4200, y: 0, w: 520, h: 90 });
  const items: Item[] = [];
  for (let i = 0; i < 22; i++) items.push({ x: 210 + i * 185, y: 265 - ((i * 47 + level * 29) % 3) * 44, type: i % 4 === 0 ? "book" : "star", taken: false });
  return { platforms, items, width: 4720 };
}

export type AboutGameContent = { title?: string; intro?: string; startLabel?: string };

export function AboutGame({ content }: { content?: AboutGameContent }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game>({ x: 70, y: 300, vx: 0, vy: 0, grounded: false, camera: 0, collected: new Set(), level: 0, won: false, time: 0 });
  const keys = useRef(new Set<string>());
  const worldsRef = useRef<Record<number, ReturnType<typeof worldFor>>>({});
  const [level, setLevel] = useState(0);
  const [, setCollected] = useState(0);
  const [storyOpen, setStoryOpen] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const levelRef = useRef(level);
  levelRef.current = level;

  const restart = useCallback(() => {
    const g = gameRef.current;
    worldsRef.current = {};
    g.x = 70; g.y = 300; g.vx = 0; g.vy = 0; g.grounded = false; g.camera = 0; g.collected = new Set(); g.won = false; g.time = 0;
    keys.current.clear(); setCollected(0); setLevel(0); levelRef.current = 0; setStoryOpen(true); setGameStarted(false);
  }, []);

  const nextLevel = useCallback(() => {
    const next = levelRef.current + 1;
    if (next >= LEVELS.length) { gameRef.current.won = true; setStoryOpen(true); setGameStarted(false); return; }
    levelRef.current = next; setLevel(next);
    worldsRef.current[next] = worldFor(next);
    const g = gameRef.current; g.level = next; g.x = 70; g.y = 270; g.vx = 0; g.vy = 0; g.camera = 0; g.collected = new Set(); g.won = false; g.time = 0;
    setCollected(0); setStoryOpen(false); setGameStarted(true);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let last = 0;
    const resize = () => { const dpr = Math.min(window.devicePixelRatio || 1, 2); canvas.width = Math.floor(canvas.clientWidth * dpr); canvas.height = Math.floor(canvas.clientHeight * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    resize(); window.addEventListener("resize", resize);
    const draw = (now: number) => {
      const dt = Math.min((now - (last || now)) / 16.67, 2); last = now;
      const w = canvas.clientWidth, h = canvas.clientHeight;
      const g = gameRef.current, li = levelRef.current, theme = LEVELS[li], world = worldsRef.current[li] || (worldsRef.current[li] = worldFor(li));
      g.level = li; g.time += dt;
      if (gameStarted && !storyOpen && !g.won) {
        const left = keys.current.has("ArrowLeft") || keys.current.has("a") || keys.current.has("left");
        const right = keys.current.has("ArrowRight") || keys.current.has("d") || keys.current.has("right");
        if (left) g.vx -= 0.75 * dt; if (right) g.vx += 0.75 * dt;
        g.vx *= Math.pow(g.grounded ? 0.79 : 0.94, dt); g.vx = Math.max(-5.4, Math.min(5.4, g.vx));
        g.vy += 0.48 * dt; g.vy = Math.min(g.vy, 13);
        g.x += g.vx * dt; g.y += g.vy * dt; g.grounded = false;
        for (const p of world.platforms) {
          const py = h - p.y;
          if (g.x + 20 > p.x && g.x - 15 < p.x + p.w && g.y + 24 >= py && g.y + 24 - g.vy * dt <= py && g.vy >= 0) { g.y = py - 24; g.vy = 0; g.grounded = true; }
        }
        if (g.y > h + 80) { g.x = Math.max(70, g.x - 180); g.y = 220; g.vy = 0; }
        g.x = Math.max(15, Math.min(world.width - 80, g.x));
        world.items.forEach((it, i) => { if (it.taken) return; if (Math.abs(g.x - it.x) < 34 && Math.abs(g.y - (h - it.y)) < 42) { it.taken = true; g.collected.add(i); setCollected(g.collected.size); } });
        g.camera += ((Math.max(0, Math.min(world.width - w, g.x - w * 0.35))) - g.camera) * 0.12;
        if (g.x > 4210) { if (li === LEVELS.length - 1) g.won = true; setStoryOpen(true); setGameStarted(false); }
      }
      const camera = g.camera;
      ctx.clearRect(0, 0, w, h);
      const sky = ctx.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, theme.sky); sky.addColorStop(1, li === 1 ? "#f5c6d7" : "#fff0c4"); ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
      // distant hills and clouds
      for (let i = 0; i < 8; i++) { const x = ((i * 270 - camera * 0.22) % (w + 340)) - 130; ctx.fillStyle = i % 2 ? "rgba(255,255,255,.18)" : "rgba(30,50,80,.12)"; ctx.beginPath(); ctx.ellipse(x, h * .62 + (i % 3) * 18, 190, 85, 0, 0, Math.PI * 2); ctx.fill(); }
      for (let i = 0; i < 7; i++) { const x = ((i * 210 + 50 - camera * .4) % (w + 240)) - 100; const y = 65 + (i % 3) * 48; ctx.fillStyle = "rgba(255,255,255,.6)"; ctx.beginPath(); ctx.ellipse(x, y, 38, 14, 0, 0, Math.PI * 2); ctx.ellipse(x + 25, y - 8, 28, 20, 0, 0, Math.PI * 2); ctx.ellipse(x + 50, y, 34, 13, 0, 0, Math.PI * 2); ctx.fill(); }
      // landmark silhouette
      if (li === 0) { ctx.fillStyle = "rgba(32,65,58,.25)"; ctx.beginPath(); ctx.moveTo(w * .63, h * .73); ctx.lineTo(w * .73, h * .22); ctx.lineTo(w * .83, h * .73); ctx.fill(); }
      if (li === 2) { ctx.fillStyle = "rgba(255,255,255,.6)"; ctx.fillRect(w * .74, h * .42, 4, h * .26); ctx.fillRect(w * .72, h * .46, w * .08, 4); }
      // ground and platforms
      for (const p of world.platforms) { const x = p.x - camera, y = h - p.y; if (x + p.w < -10 || x > w + 10) continue; ctx.fillStyle = theme.ground; ctx.fillRect(x, y, p.w, p.h); ctx.fillStyle = theme.accent; ctx.fillRect(x, y, p.w, 5); for (let k = 0; k < p.w; k += 25) { ctx.fillStyle = "rgba(255,255,255,.09)"; ctx.fillRect(x + k + 4, y + 10, 10, 3); } }
      // collectibles
      for (const it of world.items) { if (it.taken) continue; const x = it.x - camera, y = h - it.y; if (x < -40 || x > w + 40) continue; ctx.save(); ctx.translate(x, y + Math.sin(g.time * .08 + it.x) * 5); if (it.type === "star") { ctx.fillStyle = theme.accent; ctx.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? 6 : 13, a = -Math.PI / 2 + k * Math.PI / 5; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill(); } else { ctx.fillStyle = "#fff6dc"; ctx.fillRect(-9, -13, 18, 25); ctx.fillStyle = "#d95d59"; ctx.fillRect(-9, -13, 5, 25); ctx.fillStyle = "#29334c"; ctx.fillRect(-1, -6, 7, 2); ctx.fillRect(-1, 0, 7, 2); } ctx.restore(); }
      // goal gate
      const goalX = 4310 - camera; ctx.fillStyle = "rgba(255,255,255,.25)"; ctx.fillRect(goalX, h - 250, 10, 250); ctx.fillStyle = theme.accent; ctx.fillRect(goalX + 10, h - 245, 95, 43); ctx.fillStyle = "#202943"; ctx.font = "bold 11px system-ui"; ctx.fillText("NEXT CHAPTER", goalX + 18, h - 219);
      // player character, drawn from scratch with animated limbs
      const px = g.x - camera, py = g.y, run = Math.sin(g.time * .55) * (Math.abs(g.vx) > .5 ? 1 : .18); ctx.save(); ctx.translate(px, py);
      ctx.fillStyle = "rgba(22,30,50,.2)"; ctx.beginPath(); ctx.ellipse(0, 27, 22, 6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#18243d"; ctx.lineWidth = 7; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(-5, 10); ctx.lineTo(-8 + run * 8, 23); ctx.moveTo(5, 10); ctx.lineTo(9 - run * 8, 23); ctx.stroke();
      ctx.fillStyle = "#e7ad75"; ctx.fillRect(-15, -12, 30, 26); ctx.fillStyle = li === 1 ? "#f3bd55" : "#f5f0e5"; ctx.fillRect(-15, -10, 30, 17); ctx.fillStyle = "#e7ad75"; ctx.beginPath(); ctx.arc(0, -24, 14, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#202b44"; ctx.beginPath(); ctx.arc(0, -28, 15, Math.PI, Math.PI * 2); ctx.fill(); ctx.fillRect(-15, -29, 30, 5); ctx.fillStyle = "#202b44"; ctx.beginPath(); ctx.arc(5, -24, 2, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = "#202b44"; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-12, -5); ctx.lineTo(-19 + run * 7, 5); ctx.moveTo(12, -5); ctx.lineTo(18 - run * 7, 4); ctx.stroke(); ctx.restore();
      // HUD
      ctx.fillStyle = "rgba(18,27,48,.72)"; ctx.beginPath(); ctx.roundRect(18, 18, Math.min(330, w - 36), 65, 13); ctx.fill(); ctx.fillStyle = theme.accent; ctx.font = "700 11px system-ui"; ctx.fillText(`WORLD ${li + 1} / ${LEVELS.length}`, 32, 37); ctx.fillStyle = "#fffaf0"; ctx.font = "700 18px system-ui"; ctx.fillText(theme.name, 32, 60); ctx.fillStyle = "rgba(255,255,255,.85)"; ctx.font = "12px system-ui"; ctx.fillText(`✦ ${g.collected.size} collected`, Math.max(150, w - 125), 35);
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [gameStarted, storyOpen]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => { if (["ArrowLeft", "ArrowRight", "ArrowUp", " ", "a", "d", "w"].includes(e.key)) e.preventDefault(); keys.current.add(e.key); if ((e.key === " " || e.key === "ArrowUp" || e.key === "w") && gameRef.current.grounded && !storyOpen) { gameRef.current.vy = -10.7; gameRef.current.grounded = false; } };
    const up = (e: KeyboardEvent) => keys.current.delete(e.key);
    window.addEventListener("keydown", down); window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [storyOpen]);

  const hold = (key: string, active: boolean) => { if (active) keys.current.add(key); else keys.current.delete(key); };
  const jump = () => { if (!storyOpen && gameRef.current.grounded) { gameRef.current.vy = -10.7; gameRef.current.grounded = false; } };
  const current = LEVELS[level];

  return <main className="relative min-h-svh overflow-hidden bg-[#17233d] text-[#fff8e8]">
    <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-label="Playable side-scrolling game about Melchizedeck Kakese" />
    <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between p-3 sm:p-5">
      <Link to="/" aria-label="Home" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-[#17233d]/70 backdrop-blur hover:border-[#ffd166]"><Home size={17} /></Link>
      <div className="rounded-full border border-white/20 bg-[#17233d]/70 px-4 py-2 text-[10px] font-bold uppercase tracking-[.22em] backdrop-blur sm:text-xs">Melchizedeck’s Journey</div>
      <Button variant="outline" size="icon" aria-label="Restart game" onClick={restart} className="border-white/25 bg-[#17233d]/70 text-white hover:bg-white/15"><RotateCcw size={16} /></Button>
    </header>
    {!storyOpen && <div className="absolute left-1/2 top-24 z-10 hidden -translate-x-1/2 rounded-full bg-[#17233d]/60 px-4 py-2 text-xs text-white/90 backdrop-blur sm:block">Move: ← → or A/D · Jump: Space / ↑ · Collect ✦ and books</div>}
    <div className="absolute bottom-4 left-3 z-20 flex gap-2 sm:bottom-7 sm:left-7">
      <button aria-label="Move left" onPointerDown={() => hold("left", true)} onPointerUp={() => hold("left", false)} onPointerLeave={() => hold("left", false)} onPointerCancel={() => hold("left", false)} className="flex h-14 w-14 touch-none items-center justify-center rounded-2xl border border-white/25 bg-[#17233d]/75 backdrop-blur active:bg-[#ffd166] active:text-[#17233d]"><ArrowLeft /></button>
      <button aria-label="Move right" onPointerDown={() => hold("right", true)} onPointerUp={() => hold("right", false)} onPointerLeave={() => hold("right", false)} onPointerCancel={() => hold("right", false)} className="flex h-14 w-14 touch-none items-center justify-center rounded-2xl border border-white/25 bg-[#17233d]/75 backdrop-blur active:bg-[#ffd166] active:text-[#17233d]"><ArrowRight /></button>
    </div>
    <button aria-label="Jump" onPointerDown={jump} className="absolute bottom-4 right-3 z-20 flex h-16 w-16 touch-none flex-col items-center justify-center rounded-full border-2 border-[#ffd166]/80 bg-[#17233d]/80 text-[#ffd166] shadow-xl backdrop-blur active:scale-95 sm:bottom-7 sm:right-7"><span className="text-xl">↑</span><span className="text-[9px] font-bold uppercase tracking-widest">Jump</span></button>
    {storyOpen && <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#10182c]/55 p-4 backdrop-blur-[3px]"><section className="w-full max-w-xl rounded-[28px] border border-white/20 bg-[#17233d]/95 p-6 shadow-2xl sm:p-9">
      <div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[.25em] text-[#ffd166]"><Sparkles size={15} /> {level === 0 ? "An interactive autobiography" : level === LEVELS.length - 1 ? "Journey complete" : `Checkpoint ${level + 1}`}</div>
      {level === LEVELS.length - 1 && gameRef.current.won ? <><h1 className="text-3xl font-black leading-tight sm:text-5xl">The story is still being written.</h1><p className="mt-4 leading-7 text-white/75">Thanks for travelling this far. The next chapter will be shaped by the people we empower, the stories we tell and the ideas we bring to life.</p><div className="mt-7 flex flex-wrap gap-3"><Link to="/about" className="inline-flex items-center gap-2 rounded-xl bg-[#ffd166] px-5 py-3 font-bold text-[#17233d]"><BookOpen size={17} /> Read my story</Link><Link to="/projects" className="rounded-xl border border-white/25 px-5 py-3 font-semibold">Explore projects</Link><Button variant="outline" onClick={restart} className="border-white/25 text-white hover:bg-white/10">Play again</Button></div></> : <><p className="text-xs font-bold uppercase tracking-[.2em] text-white/55">{current.subtitle}</p><h1 className="mt-2 text-3xl font-black leading-tight sm:text-5xl">{level === 0 ? (content?.title || "Don’t just read my story. Walk through it.") : current.name}</h1><p className="mt-4 max-w-lg leading-7 text-white/75">{level === 0 ? (content?.intro || "A playable journey through the places, pages and people that shaped Melchizedeck Kakese.") : current.story}</p><div className="mt-6 flex flex-wrap items-center gap-3"><Button onClick={() => { if (level === 0) { setStoryOpen(false); setGameStarted(true); } else nextLevel(); }} className="h-12 rounded-xl bg-[#ffd166] px-6 font-bold text-[#17233d] hover:bg-[#ffe39b]">{level === 0 ? (content?.startLabel || "Enter the journey") : "Continue journey"} <ArrowRight className="ml-2" size={17} /></Button><span className="text-xs text-white/50">{level === 0 ? "4 worlds · hidden collectibles · your story" : `World ${level + 1} of ${LEVELS.length}`}</span></div><p className="mt-6 text-xs leading-5 text-white/45">Desktop: arrow keys or A/D to move, Space or ↑ to jump. Phone: use the on-screen controls.</p></>}
    </section></div>}
  </main>;
}
