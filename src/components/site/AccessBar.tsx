import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUnlockEmail } from "@/lib/locks";
import { Mail, LogOut } from "lucide-react";

export function AccessBar({ bundleExpiresAt }: { bundleExpiresAt?: string | null }) {
  const [email, setEmail] = useUnlockEmail();
  const [draft, setDraft] = useState("");

  if (email) {
    return (
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-border/60 bg-card/40 px-4 py-3 text-sm">
        <Mail className="h-4 w-4 text-gold" />
        <span className="text-muted-foreground">Access as</span>
        <span className="font-medium text-cream">{email}</span>
        {bundleExpiresAt && (
          <span className="ml-2 rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-[11px] text-gold">
            Free pick active until {new Date(bundleExpiresAt).toLocaleTimeString()}
          </span>
        )}
        <button className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive" onClick={() => setEmail("")}>
          <LogOut className="h-3 w-3" /> Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 rounded-lg border border-border/60 bg-card/40 p-3 text-sm">
      <span className="text-muted-foreground">Already paid? Enter your email to restore access:</span>
      <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="you@example.com" className="h-9 max-w-xs" />
      <Button size="sm" onClick={() => draft.includes("@") && setEmail(draft)}>Restore</Button>
    </div>
  );
}
