import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Admin" }, { name: "robots", content: "noindex" }] }),
  component: Auth,
});

function Auth() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) nav({ to: "/admin" });
    });
  }, [nav]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const fn = mode === "sign-in"
      ? supabase.auth.signInWithPassword({ email, password })
      : supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/admin" } });
    const { error } = await fn;
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success(mode === "sign-in" ? "Welcome back." : "Account created.");
    nav({ to: "/admin" });
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-md px-6 py-24">
        <h1 className="font-serif text-4xl text-cream">Admin access</h1>
        <p className="mt-2 text-sm text-muted-foreground">Only the site owner can edit content.</p>
        <form onSubmit={submit} className="mt-8 space-y-4 rounded-xl border border-border/60 bg-card/60 p-6">
          <Input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input required type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} />
          <Button type="submit" disabled={loading} className="w-full bg-gold text-primary-foreground hover:opacity-90">
            {loading ? "…" : mode === "sign-in" ? "Sign in" : "Create account"}
          </Button>
          <button type="button" className="w-full text-xs text-muted-foreground hover:text-gold" onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}>
            {mode === "sign-in" ? "First time? Create an account" : "Already have an account? Sign in"}
          </button>
        </form>
      </section>
    </SiteLayout>
  );
}
