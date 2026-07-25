import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useUnlockEmail } from "@/lib/locks";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listUnlocks } from "@/lib/payments.functions";
import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, BookOpen, FileText, Hourglass } from "lucide-react";

export const Route = createFileRoute("/unlock")({
  head: () => ({
    meta: [
      { title: "Confirming your payment — Melchizedeck Kakese" },
      {
        name: "description",
        content:
          "We are confirming your Selcom payment and unlocking your access to books and screenplays.",
      },
    ],
  }),
  component: Unlock,
});

function Unlock() {
  const [email] = useUnlockEmail();
  const list = useServerFn(listUnlocks);
  const [ref] = useState(() =>
    typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("ref") ?? "" : "",
  );
  const [elapsed, setElapsed] = useState(0);

  // Poll for up to ~2 minutes while we wait for the Selcom webhook to confirm.
  useEffect(() => {
    if (elapsed >= 120) return;
    const t = setTimeout(() => setElapsed((e) => e + 3), 3000);
    return () => clearTimeout(t);
  }, [elapsed]);

  const { data } = useQuery({
    queryKey: ["unlocks", email, "unlock-page"],
    enabled: !!email && email.includes("@"),
    queryFn: async () => list({ data: { email } }),
    refetchInterval: elapsed < 120 ? 3000 : false,
    staleTime: 0,
  });

  const hasAccess = (data?.itemIds?.length ?? 0) > 0;
  const timedOut = elapsed >= 120 && !hasAccess;

  return (
    <SiteLayout>
      <section className="mx-auto flex max-w-xl flex-col items-center px-6 py-32 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/40 bg-card/60">
          {hasAccess ? (
            <CheckCircle2 className="h-8 w-8 text-gold" />
          ) : timedOut ? (
            <Hourglass className="h-8 w-8 text-gold" />
          ) : (
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
          )}
        </div>

        <h1 className="mt-6 font-serif text-4xl text-cream">
          {hasAccess ? "Access confirmed" : timedOut ? "Still confirming" : "Confirming your payment"}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {hasAccess
            ? "Thank you! Your payment has been confirmed and your access is ready."
            : timedOut
              ? "We haven't received confirmation from Selcom yet. If you completed payment, your access will appear automatically once it arrives — you do not need to pay again."
              : "We're waiting for confirmation from Selcom. This usually takes a few seconds. Leave this page open; your access will appear automatically."}
        </p>
        {email && <p className="mt-2 text-xs text-muted-foreground/80">Linked to {email}</p>}
        {ref && <p className="mt-1 text-[11px] text-muted-foreground/60">Order {ref.slice(0, 8)}</p>}

        {hasAccess && (
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="/books"
              className="inline-flex items-center rounded-md bg-gold px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              <BookOpen className="mr-2 h-4 w-4" /> Open Books
            </a>
            <a
              href="/scripts"
              className="inline-flex items-center rounded-md border border-border/60 px-4 py-2 text-sm font-medium text-cream hover:border-gold/60"
            >
              <FileText className="mr-2 h-4 w-4" /> Open Screenplays
            </a>
          </div>
        )}

        {timedOut && (
          <div className="mt-8">
            <a
              href="/books"
              className="inline-flex items-center rounded-md border border-border/60 px-4 py-2 text-sm font-medium text-cream hover:border-gold/60"
            >
              Back to Books
            </a>
          </div>
        )}

        {!email && (
          <p className="mt-6 text-sm text-muted-foreground">
            If you just paid, return to <a className="text-gold underline" href="/books">Books</a> or{" "}
            <a className="text-gold underline" href="/scripts">Screenplays</a> — your access is tied to
            the email you entered at checkout.
          </p>
        )}
      </section>
    </SiteLayout>
  );
}
