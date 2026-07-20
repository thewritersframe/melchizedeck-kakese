import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) { toast.error("Please enter a valid email"); return; }
    setLoading(true);
    const { error } = await supabase.from("subscribers").insert({ email });
    setLoading(false);
    if (error) {
      if (error.code === "23505") toast.success("You're already subscribed!");
      else toast.error(error.message);
    } else {
      toast.success("Thanks — you're on the list.");
      setEmail("");
    }
  }
  return (
    <form onSubmit={submit} className="mx-auto flex max-w-md gap-2">
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="bg-card"
        required
      />
      <Button type="submit" disabled={loading} className="bg-gold text-primary-foreground hover:opacity-90">
        {loading ? "..." : "Subscribe"}
      </Button>
    </form>
  );
}
