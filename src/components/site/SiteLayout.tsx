import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu, X, ShieldCheck } from "lucide-react";
import { useIsAdmin } from "@/lib/cms";
import { useSection } from "@/lib/cms";
import { cn } from "@/lib/utils";

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
            filter: "blur(28px) saturate(115%)",
            transform: "scale(1.15)",
            opacity: 0.75,
          }}
        />
      )}
      {/* Decorative overlay — kept lighter so the photo dominates */}
      <div
        aria-hidden
        className="bg-hero-pattern pointer-events-none fixed inset-0 -z-10 opacity-30 mix-blend-multiply"
      />
      {/* Subtle darkening for legibility */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-background/45" />

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
