import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type PageSection<T = Record<string, unknown>> = {
  id: string;
  page: string;
  section_key: string;
  content: T;
};

export type ContentItem = {
  id: string;
  collection: string;
  slug: string | null;
  title: string;
  subtitle: string | null;
  body: string | null;
  image_url: string | null;
  meta: Record<string, unknown>;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export function useSection<T = Record<string, unknown>>(page: string, key: string) {
  return useQuery({
    queryKey: ["section", page, key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_sections")
        .select("*")
        .eq("page", page)
        .eq("section_key", key)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as PageSection<T> | null);
    },
  });
}

export function useCollection(collection: string, opts: { admin?: boolean } = {}) {
  return useQuery({
    queryKey: ["collection", collection, opts.admin ?? false],
    queryFn: async () => {
      let q = supabase.from("content_items").select("*").eq("collection", collection).order("sort_order").order("created_at", { ascending: false });
      if (!opts.admin) q = q.eq("published", true);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as ContentItem[];
    },
  });
}

export function useIsAdmin() {
  return useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return false;
      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userData.user.id).eq("role", "admin").maybeSingle();
      if (error) return false;
      return !!data;
    },
  });
}

export async function uploadMedia(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type,
  });
  if (error) throw error;
  // Long-lived signed URL (100 years) — bucket is private but URL is shareable
  const { data, error: signErr } = await supabase.storage
    .from("media")
    .createSignedUrl(path, 60 * 60 * 24 * 365 * 50);
  if (signErr) throw signErr;
  return data.signedUrl;
}
