import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin, uploadMedia } from "@/lib/cms";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Trash2, Plus, Upload, LogOut, ImageIcon } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Dashboard" }, { name: "robots", content: "noindex" }] }),
  component: Admin,
});

const PAGES: { page: string; sections: { key: string; label: string; fields: FieldSpec[] }[] }[] = [
  { page: "home", sections: [
    { key: "hero", label: "Hero", fields: [
      { name: "eyebrow", label: "Eyebrow" },
      { name: "title", label: "Title" },
      { name: "subtitle", label: "Subtitle", type: "textarea" },
      { name: "ctaPrimaryLabel", label: "Primary button label" },
      { name: "ctaPrimaryTo", label: "Primary button link" },
      { name: "ctaSecondaryLabel", label: "Secondary button label" },
      { name: "ctaSecondaryTo", label: "Secondary button link" },
    ]},
    { key: "featured", label: "Featured Work", fields: [
      { name: "label", label: "Section label" },
      { name: "title", label: "Title" },
      { name: "body", label: "Body", type: "textarea" },
      { name: "imageUrl", label: "Image", type: "image" },
      { name: "primaryLabel", label: "Primary button label" },
      { name: "primaryTo", label: "Primary button link" },
      { name: "secondaryLabel", label: "Secondary button label" },
      { name: "secondaryTo", label: "Secondary button link" },
    ]},
    { key: "pillars", label: "What Drives the Work", fields: [
      { name: "title", label: "Section title" },
      { name: "items", label: "Pillars (JSON array of {title, body})", type: "json" },
    ]},
    { key: "newsletter", label: "Newsletter", fields: [
      { name: "title", label: "Title" },
      { name: "body", label: "Body", type: "textarea" },
    ]},
  ]},
  { page: "about", sections: [
    { key: "main", label: "About", fields: [
      { name: "title", label: "Title" },
      { name: "body", label: "Body", type: "textarea" },
      { name: "imageUrl", label: "Portrait image", type: "image" },
    ]},
  ]},
  { page: "books", sections: [{ key: "header", label: "Header", fields: [{ name: "title", label: "Title" }, { name: "body", label: "Intro", type: "textarea" }] }] },
  { page: "scripts", sections: [{ key: "header", label: "Header", fields: [{ name: "title", label: "Title" }, { name: "body", label: "Intro", type: "textarea" }] }] },
  { page: "blog", sections: [{ key: "header", label: "Header", fields: [{ name: "title", label: "Title" }, { name: "body", label: "Intro", type: "textarea" }] }] },
  { page: "events", sections: [{ key: "header", label: "Header", fields: [{ name: "title", label: "Title" }, { name: "body", label: "Intro", type: "textarea" }] }] },
  { page: "advocacy", sections: [{ key: "header", label: "Header", fields: [{ name: "title", label: "Title" }, { name: "body", label: "Intro", type: "textarea" }] }] },
  { page: "contact", sections: [{ key: "main", label: "Contact", fields: [
    { name: "title", label: "Title" }, { name: "body", label: "Body", type: "textarea" },
    { name: "email", label: "Public email" }, { name: "location", label: "Location" },
  ]}]},
  { page: "site", sections: [{ key: "footer", label: "Footer", fields: [
    { name: "tagline", label: "Tagline" }, { name: "copyright", label: "Copyright text" },
  ]}]},
];

const COLLECTIONS = [
  { key: "book", label: "Books", extraMeta: [{ name: "buy_url", label: "Buy link" }] },
  { key: "blog", label: "Blog posts", extraMeta: [] },
  { key: "script", label: "Scripts", extraMeta: [] },
  { key: "event", label: "Events", extraMeta: [{ name: "date", label: "Date" }, { name: "location", label: "Location" }, { name: "url", label: "Details link" }] },
  { key: "advocacy", label: "Advocacy & adventures", extraMeta: [] },
];

type FieldSpec = { name: string; label: string; type?: "text" | "textarea" | "image" | "json" };

function Admin() {
  const nav = useNavigate();
  const { data: isAdmin, isLoading } = useIsAdmin();
  const [checkedSession, setCheckedSession] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) nav({ to: "/auth" });
      setCheckedSession(true);
    });
  }, [nav]);

  if (!checkedSession || isLoading) {
    return <SiteLayout><div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-gold" /></div></SiteLayout>;
  }

  if (!isAdmin) {
    return (
      <SiteLayout>
        <section className="mx-auto max-w-md px-6 py-24 text-center">
          <h1 className="font-serif text-3xl text-cream">Not an admin yet</h1>
          <p className="mt-3 text-sm text-muted-foreground">You're signed in but haven't been promoted to admin. Share your account email with the site owner to be granted access.</p>
          <Button className="mt-6" variant="outline" onClick={async () => { await supabase.auth.signOut(); nav({ to: "/auth" }); }}>Sign out</Button>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl text-cream">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">Edit any part of the site. Changes go live instantly.</p>
          </div>
          <div className="flex gap-2">
            <Link to="/" className="rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:text-gold">View site</Link>
            <Button variant="outline" size="sm" onClick={async () => { await supabase.auth.signOut(); nav({ to: "/" }); }}>
              <LogOut className="mr-1 h-4 w-4" /> Sign out
            </Button>
          </div>
        </div>

        <Tabs defaultValue="pages">
          <TabsList className="flex-wrap">
            <TabsTrigger value="pages">Pages</TabsTrigger>
            <TabsTrigger value="collections">Collections</TabsTrigger>
            <TabsTrigger value="inbox">Inbox</TabsTrigger>
          </TabsList>

          <TabsContent value="pages" className="mt-6">
            <Tabs defaultValue={PAGES[0].page}>
              <TabsList className="flex-wrap">
                {PAGES.map((p) => <TabsTrigger key={p.page} value={p.page} className="capitalize">{p.page}</TabsTrigger>)}
              </TabsList>
              {PAGES.map((p) => (
                <TabsContent key={p.page} value={p.page} className="mt-6 space-y-6">
                  {p.sections.map((s) => (
                    <SectionEditor key={s.key} page={p.page} sectionKey={s.key} label={s.label} fields={s.fields} />
                  ))}
                </TabsContent>
              ))}
            </Tabs>
          </TabsContent>

          <TabsContent value="collections" className="mt-6">
            <Tabs defaultValue={COLLECTIONS[0].key}>
              <TabsList className="flex-wrap">
                {COLLECTIONS.map((c) => <TabsTrigger key={c.key} value={c.key}>{c.label}</TabsTrigger>)}
              </TabsList>
              {COLLECTIONS.map((c) => (
                <TabsContent key={c.key} value={c.key} className="mt-6">
                  <CollectionEditor collection={c.key} label={c.label} extraMeta={c.extraMeta} />
                </TabsContent>
              ))}
            </Tabs>
          </TabsContent>

          <TabsContent value="inbox" className="mt-6"><Inbox /></TabsContent>
        </Tabs>
      </section>
    </SiteLayout>
  );
}

function SectionEditor({ page, sectionKey, label, fields }: { page: string; sectionKey: string; label: string; fields: FieldSpec[] }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-section", page, sectionKey],
    queryFn: async () => {
      const { data, error } = await supabase.from("page_sections").select("*").eq("page", page).eq("section_key", sectionKey).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const [form, setForm] = useState<Record<string, unknown>>({});
  useEffect(() => { if (data) setForm(data.content as Record<string, unknown>); }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const payload = { page, section_key: sectionKey, content: form as never };
      const { error } = await supabase.from("page_sections").upsert(payload as never, { onConflict: "page,section_key" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(`${label} saved`);
      qc.invalidateQueries({ queryKey: ["section", page, sectionKey] });
      qc.invalidateQueries({ queryKey: ["admin-section", page, sectionKey] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <div className="rounded-lg border border-border/60 p-6"><Loader2 className="h-4 w-4 animate-spin" /></div>;

  return (
    <div className="rounded-xl border border-border/60 bg-card/40 p-6">
      <h3 className="font-serif text-xl text-cream">{label}</h3>
      <div className="mt-4 grid gap-4">
        {fields.map((f) => (
          <FieldInput key={f.name} field={f} value={form[f.name]} onChange={(v) => setForm({ ...form, [f.name]: v })} />
        ))}
      </div>
      <Button className="mt-6 bg-gold text-primary-foreground hover:opacity-90" disabled={save.isPending} onClick={() => save.mutate()}>
        {save.isPending ? "Saving…" : "Save changes"}
      </Button>
    </div>
  );
}

function FieldInput({ field, value, onChange }: { field: FieldSpec; value: unknown; onChange: (v: unknown) => void }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  if (field.type === "textarea") {
    return (
      <label className="block">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">{field.label}</span>
        <Textarea rows={4} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} className="mt-1.5" />
      </label>
    );
  }
  if (field.type === "image") {
    const url = String(value ?? "");
    return (
      <div>
        <span className="text-xs uppercase tracking-widest text-muted-foreground">{field.label}</span>
        <div className="mt-1.5 flex flex-wrap items-center gap-3">
          {url ? (
            <img src={url} alt="" className="h-20 w-20 rounded-md border border-border/60 object-cover" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-md border border-dashed border-border text-muted-foreground"><ImageIcon className="h-5 w-5" /></div>
          )}
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-accent/10">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? `Uploading… ${progress}%` : "Upload image"}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/svg+xml" className="hidden" onChange={async (e) => {
              const file = e.target.files?.[0]; if (!file) return;
              setUploading(true); setProgress(0);
              const t = toast.loading("Uploading image…");
              try {
                const u = await uploadMedia(file, { onProgress: (p) => setProgress(p) });
                onChange(u);
                toast.success("Uploaded", { id: t });
              } catch (err) {
                toast.error((err as Error).message, { id: t });
              } finally {
                setUploading(false); setProgress(0); e.target.value = "";
              }
            }} />
          </label>
          {url && <button type="button" className="text-xs text-muted-foreground hover:text-destructive" onClick={() => onChange("")}>Remove</button>}
        </div>
        {uploading && (
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border/60">
            <div className="h-full bg-gold transition-[width] duration-200" style={{ width: `${progress}%` }} />
          </div>
        )}
        <p className="mt-1 text-[11px] text-muted-foreground">JPG, PNG, WEBP, GIF, AVIF or SVG · max 10MB</p>
        <Input value={url} onChange={(e) => onChange(e.target.value)} placeholder="or paste image URL" className="mt-2" />
      </div>
    );
  }
  if (field.type === "json") {
    const text = typeof value === "string" ? value : JSON.stringify(value ?? [], null, 2);
    return (
      <label className="block">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">{field.label}</span>
        <Textarea rows={8} value={text} onChange={(e) => {
          try { onChange(JSON.parse(e.target.value)); }
          catch { onChange(e.target.value); }
        }} className="mt-1.5 font-mono text-xs" />
      </label>
    );
  }
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-widest text-muted-foreground">{field.label}</span>
      <Input value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} className="mt-1.5" />
    </label>
  );
}

function CollectionEditor({ collection, label, extraMeta }: { collection: string; label: string; extraMeta: { name: string; label: string }[] }) {
  const qc = useQueryClient();
  const { data: items, isLoading } = useQuery({
    queryKey: ["admin-collection", collection],
    queryFn: async () => {
      const { data, error } = await supabase.from("content_items").select("*").eq("collection", collection).order("sort_order").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-collection", collection] });
    qc.invalidateQueries({ queryKey: ["collection", collection] });
  };

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("content_items").insert({ collection, title: "Untitled", published: true });
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-serif text-xl text-cream">{label}</h3>
        <Button size="sm" onClick={() => create.mutate()} className="bg-gold text-primary-foreground hover:opacity-90">
          <Plus className="mr-1 h-4 w-4" /> New
        </Button>
      </div>
      {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
        <div className="space-y-4">
          {items?.length === 0 && <p className="text-sm text-muted-foreground">No items yet.</p>}
          {items?.map((item) => (
            <ItemEditor key={item.id} item={item as unknown as Item} extraMeta={extraMeta} onChange={invalidate} />
          ))}
        </div>
      )}
    </div>
  );
}

type Item = {
  id: string; collection: string; title: string; subtitle: string | null; body: string | null;
  image_url: string | null; meta: Record<string, unknown>; sort_order: number; published: boolean;
};

function ItemEditor({ item, extraMeta, onChange }: { item: Item; extraMeta: { name: string; label: string }[]; onChange: () => void }) {
  const [form, setForm] = useState(item);
  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("content_items").update({
        title: form.title, subtitle: form.subtitle, body: form.body,
        image_url: form.image_url, meta: form.meta as never, sort_order: form.sort_order, published: form.published,
      }).eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Saved"); onChange(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("content_items").delete().eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Deleted"); onChange(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="rounded-xl border border-border/60 bg-card/40 p-5">
      <div className="grid gap-4 md:grid-cols-[160px_1fr]">
        <div>
          <FieldInput field={{ name: "image_url", label: "Image", type: "image" }} value={form.image_url} onChange={(v) => setForm({ ...form, image_url: String(v) })} />
        </div>
        <div className="grid gap-3">
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" />
          <Input value={form.subtitle ?? ""} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="Subtitle" />
          <Textarea rows={4} value={form.body ?? ""} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Body" />
          {extraMeta.map((m) => (
            <Input key={m.name} placeholder={m.label} value={String((form.meta as Record<string, unknown>)?.[m.name] ?? "")}
              onChange={(e) => setForm({ ...form, meta: { ...(form.meta as Record<string, unknown>), [m.name]: e.target.value } })} />
          ))}
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
              Published
            </label>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              Order
              <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className="w-24" />
            </label>
            <div className="ml-auto flex gap-2">
              <Button size="sm" onClick={() => save.mutate()} disabled={save.isPending} className="bg-gold text-primary-foreground hover:opacity-90">
                {save.isPending ? "…" : "Save"}
              </Button>
              <Button size="sm" variant="destructive" onClick={() => { if (confirm("Delete this item?")) del.mutate(); }}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Inbox() {
  const qc = useQueryClient();
  const { data: messages } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: async () => (await supabase.from("messages").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const { data: subs } = useQuery({
    queryKey: ["admin-subs"],
    queryFn: async () => (await supabase.from("subscribers").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <h3 className="font-serif text-xl text-cream">Messages ({messages?.length ?? 0})</h3>
        <div className="mt-4 space-y-3">
          {messages?.map((m) => (
            <div key={m.id} className="rounded-lg border border-border/60 bg-card/40 p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-cream">{m.name} <span className="text-xs text-muted-foreground">({m.kind})</span></p>
                <button className="text-muted-foreground hover:text-destructive" onClick={async () => {
                  await supabase.from("messages").delete().eq("id", m.id);
                  qc.invalidateQueries({ queryKey: ["admin-messages"] });
                }}><Trash2 className="h-4 w-4" /></button>
              </div>
              <p className="text-xs text-muted-foreground">{m.email} · {new Date(m.created_at).toLocaleString()}</p>
              {m.subject && <p className="mt-2 text-sm text-gold">{m.subject}</p>}
              <p className="mt-2 whitespace-pre-wrap text-sm">{m.body}</p>
            </div>
          ))}
          {messages?.length === 0 && <p className="text-sm text-muted-foreground">No messages.</p>}
        </div>
      </div>
      <div>
        <h3 className="font-serif text-xl text-cream">Subscribers ({subs?.length ?? 0})</h3>
        <div className="mt-4 space-y-2">
          {subs?.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-md border border-border/60 bg-card/40 px-3 py-2 text-sm">
              <span>{s.email}</span>
              <span className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</span>
            </div>
          ))}
          {subs?.length === 0 && <p className="text-sm text-muted-foreground">No subscribers yet.</p>}
        </div>
      </div>
    </div>
  );
}
