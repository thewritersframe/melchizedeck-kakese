import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu, X, ShieldCheck } from "lucide-react";
import { useIsAdmin } from "@/lib/cms";
import { useSection } from "@/lib/cms";
import { cn } from "@/lib/utils";
import bgPhoto from "@/assets/kakese-community.jpg.asset.json";

// Jungle/wild African decorative motif — palm fronds, acacia silhouettes, tribal marks
const JUNGLE_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='420' height='420' viewBox='0 0 420 420'>
    <g fill='none' stroke='%23e5b567' stroke-width='1.2' stroke-linecap='round' opacity='0.55'>
      <!-- palm frond -->
      <path d='M60 380 Q90 250 140 160'/>
      <path d='M80 340 Q60 320 40 315'/><path d='M90 310 Q70 288 48 282'/>
      <path d='M100 280 Q82 258 60 250'/><path d='M112 248 Q96 226 74 216'/>
      <path d='M124 214 Q112 192 92 180'/><path d='M136 180 Q128 160 112 148'/>
      <!-- acacia tree -->
      <path d='M330 380 L330 250'/>
      <path d='M270 240 Q330 200 390 240 Q380 220 330 210 Q280 220 270 240 Z'/>
      <path d='M290 220 Q330 195 370 220'/>
      <!-- leaf -->
      <path d='M210 90 Q240 60 270 90 Q240 120 210 90 Z'/><path d='M240 62 L240 118'/>
      <!-- tribal dots -->
      <circle cx='30' cy='40' r='2' fill='%23e5b567' stroke='none'/>
      <circle cx='50' cy='30' r='1.5' fill='%23e5b567' stroke='none'/>
      <circle cx='70' cy='45' r='1.8' fill='%23e5b567' stroke='none'/>
      <circle cx='380' cy='60' r='2' fill='%23e5b567' stroke='none'/>
      <circle cx='400' cy='80' r='1.5' fill='%23e5b567' stroke='none'/>
      <!-- zigzag -->
      <path d='M150 400 L165 388 L180 400 L195 388 L210 400 L225 388 L240 400'/>
      <path d='M0 200 L12 190 L24 200 L36 190 L48 200'/>
    </g>
  </svg>`
)}`;

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/books", label: "Books" },
  { to: "/scripts", label: "Scripts" },
  { to: "/blog", label: "Blog" },
  { to: "/events", label: "Events" },
  { to: "/advocacy", label: "Advocacy & Adventures" },
  { to: "/contact", label: "Contact & Partner" },
] as const;

export function SiteLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const { data: isAdmin } = useIsAdmin();
  const { data: footer } = useSection<{ tagline?: string; copyright?: string }>("site", "footer");
  const { data: about } = useSection<{ imageUrl?: string }>("about", "main");
  const bgImage = about?.content?.imageUrl;

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Global blurred backdrop from About photo */}
      {bgImage && (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url("${bgImage}")`,
            filter: "blur(18px) saturate(120%)",
            transform: "scale(1.15)",
            opacity: 1,
          }}
        />
      )}
      {/* Decorative overlay — kept lighter so the photo dominates */}
      <div
        aria-hidden
        className="bg-hero-pattern pointer-events-none fixed inset-0 -z-10 opacity-15 mix-blend-overlay"
      />
      {/* Subtle darkening for legibility */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-background/25" />


      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link to="/" className="font-serif text-xl tracking-wide text-cream">
            M.<span className="text-gold">Kakese</span>
          </Link>
          <nav className="hidden items-center gap-7 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "text-sm transition-colors hover:text-gold",
                  pathname === item.to ? "text-gold" : "text-muted-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin" className="inline-flex items-center gap-1.5 rounded-md border border-gold/40 px-3 py-1.5 text-xs text-gold hover:bg-gold/10">
                <ShieldCheck className="h-3.5 w-3.5" /> Admin
              </Link>
            )}
          </nav>
          <button className="lg:hidden text-cream" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && (
          <div className="border-t border-border/40 bg-background/95 lg:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col px-6 py-4">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "py-2 text-sm",
                    pathname === item.to ? "text-gold" : "text-muted-foreground",
                  )}
                >
                  {item.label}
                </Link>
              ))}
              {isAdmin && (
                <Link to="/admin" onClick={() => setOpen(false)} className="mt-2 py-2 text-sm text-gold">
                  Admin dashboard
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/40 bg-background/60">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 px-6 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-serif text-lg text-cream">M.<span className="text-gold">Kakese</span></div>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">{footer?.content?.tagline ?? "Words that move continents."}</p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {NAV.slice(1).map((n) => (
              <Link key={n.to} to={n.to} className="hover:text-gold">{n.label}</Link>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{footer?.content?.copyright ?? "© Melchizedeck Kakese."}</p>
        </div>
      </footer>
    </div>
  );
}
