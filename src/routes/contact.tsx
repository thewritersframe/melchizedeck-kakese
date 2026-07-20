import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useSection } from "@/lib/cms";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, MapPin } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact & Partner — Melchizedeck Kakese" }, { name: "description", content: "For collaborations, speaking, or partnerships." }] }),
  component: Contact,
});

function Contact() {
  const { data } = useSection<{ title: string; body: string; email?: string; location?: string }>("contact", "main");
  const c = data?.content;
  const [form, setForm] = useState({ name: "", email: "", subject: "", body: "", kind: "contact" });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("messages").insert(form);
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success("Message sent."); setForm({ name: "", email: "", subject: "", body: "", kind: "contact" }); }
  }

  return (
    <SiteLayout>
      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-24 md:grid-cols-2">
        <div>
          <h1 className="font-serif text-5xl text-cream">{c?.title}</h1>
          <p className="mt-4 text-muted-foreground">{c?.body}</p>
          <div className="mt-8 space-y-3 text-sm">
            {c?.email && <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-gold" /> {c.email}</div>}
            {c?.location && <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-gold" /> {c.location}</div>}
          </div>
        </div>
        <form onSubmit={submit} className="space-y-4 rounded-xl border border-border/60 bg-card/60 p-6">
          <div className="flex gap-2">
            {["contact", "partner"].map((k) => (
              <button key={k} type="button" onClick={() => setForm({ ...form, kind: k })}
                className={`flex-1 rounded-md border px-3 py-2 text-sm capitalize transition ${form.kind === k ? "border-gold bg-gold/10 text-gold" : "border-border text-muted-foreground"}`}>
                {k === "contact" ? "Say hello" : "Partner with me"}
              </button>
            ))}
          </div>
          <Input required placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          <Textarea required rows={6} placeholder="Your message…" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          <Button type="submit" disabled={loading} className="w-full bg-gold text-primary-foreground hover:opacity-90">
            {loading ? "Sending…" : "Send message"}
          </Button>
        </form>
      </section>
    </SiteLayout>
  );
}
