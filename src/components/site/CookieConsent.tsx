import { useEffect, useState } from "react";
import { Cookie } from "lucide-react";

const KEY = "mk_cookie_consent";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(KEY)) setShow(true);
    } catch {
      /* ignore */
    }
  }, []);

  const decide = (value: "accepted" | "essential") => {
    try {
      window.localStorage.setItem(KEY, value);
      document.cookie = `mk_cookie_consent=${value}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    } catch {
      /* ignore */
    }
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-xl border border-gold/30 bg-background/95 p-4 shadow-lg backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
          <p className="text-sm text-muted-foreground">
            This site uses cookies to remember your preferences, your local currency and any
            content you've unlocked. Nothing is sold or shared.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => decide("essential")}
            className="rounded-md border border-border/60 px-3 py-2 text-xs text-cream transition hover:border-gold/60 hover:text-gold"
          >
            Essential only
          </button>
          <button
            onClick={() => decide("accepted")}
            className="rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition hover:opacity-90"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
