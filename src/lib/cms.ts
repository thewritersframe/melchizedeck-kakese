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

export async function fetchSection<T = Record<string, unknown>>(page: string, key: string) {
  const { data, error } = await supabase
    .from("page_sections")
    .select("*")
    .eq("page", page)
    .eq("section_key", key)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as PageSection<T> | null);
}

export async function fetchCollection(collection: string, opts: { admin?: boolean } = {}) {
  let q = supabase.from("content_items").select("*").eq("collection", collection).order("sort_order").order("created_at", { ascending: false });
  if (!opts.admin) q = q.eq("published", true);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as unknown as ContentItem[];
}

export function useSection<T = Record<string, unknown>>(
  page: string,
  key: string,
  opts: { initialData?: PageSection<T> | null } = {},
) {
  return useQuery({
    queryKey: ["section", page, key],
    queryFn: () => fetchSection<T>(page, key),
    ...(opts.initialData !== undefined ? { initialData: opts.initialData } : {}),
  });
}

export function useCollection(
  collection: string,
  opts: { admin?: boolean; initialData?: ContentItem[] } = {},
) {
  return useQuery({
    queryKey: ["collection", collection, opts.admin ?? false],
    queryFn: () => fetchCollection(collection, opts),
    ...(opts.initialData !== undefined ? { initialData: opts.initialData } : {}),
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

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
];
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB

export const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-m4v",
  "video/ogg",
];
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50MB (storage per-file limit)

export type UploadOptions = {
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
  maxRetries?: number;
  allowedTypes?: string[];
  maxBytes?: number;
  kindLabel?: string;
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function uploadOnce(
  path: string,
  file: File,
  token: string,
  onProgress?: (p: number) => void,
  signal?: AbortSignal,
): Promise<void> {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/media/${path}`;
  const apikey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.setRequestHeader("apikey", apikey);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("x-upsert", "false");
    xhr.setRequestHeader("cache-control", "31536000");
    if (file.type) xhr.setRequestHeader("content-type", file.type);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed (${xhr.status}): ${xhr.responseText || xhr.statusText}`));
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.onabort = () => reject(new Error("Upload aborted"));
    if (signal) {
      if (signal.aborted) { xhr.abort(); return; }
      signal.addEventListener("abort", () => xhr.abort());
    }
    xhr.send(file);
  });
}

export async function uploadMedia(file: File, opts: UploadOptions = {}): Promise<string> {
  const allowed = opts.allowedTypes ?? ALLOWED_IMAGE_TYPES;
  const maxBytes = opts.maxBytes ?? MAX_IMAGE_BYTES;
  const isVideo = allowed === ALLOWED_VIDEO_TYPES;
  // Validation
  if (!allowed.includes(file.type)) {
    throw new Error(
      isVideo
        ? `Unsupported file type "${file.type || "unknown"}". Use MP4, WEBM, MOV, M4V, or OGG.`
        : `Unsupported file type "${file.type || "unknown"}". Use JPG, PNG, WEBP, GIF, AVIF, or SVG.`,
    );
  }
  if (file.size > maxBytes) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(`File is ${mb}MB — max is ${Math.round(maxBytes / (1024 * 1024))}MB.`);
  }
  if (file.size === 0) throw new Error("File is empty.");


  const { data: sess } = await supabase.auth.getSession();
  const token = sess.session?.access_token;
  if (!token) throw new Error("You need to be signed in to upload.");

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const maxRetries = opts.maxRetries ?? 3;

  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      opts.onProgress?.(0);
      await uploadOnce(path, file, token, opts.onProgress, opts.signal);
      opts.onProgress?.(100);
      lastErr = undefined;
      break;
    } catch (err) {
      lastErr = err;
      if (opts.signal?.aborted) throw err;
      if (attempt < maxRetries) await sleep(500 * attempt);
    }
  }
  if (lastErr) throw lastErr;

  // Signed URL with retries
  let signed: string | undefined;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const { data, error } = await supabase.storage
      .from("media")
      .createSignedUrl(path, 60 * 60 * 24 * 365 * 50);
    if (!error && data?.signedUrl) { signed = data.signedUrl; break; }
    if (attempt < 3) await sleep(400 * attempt);
  }
  if (!signed) throw new Error("Uploaded, but failed to generate a URL. Try again.");

  // Preload to warm CDN cache so it appears instantly (images only)
  if (!isVideo) {
    try {
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = signed as string;
        setTimeout(() => resolve(), 4000);
      });
    } catch { /* ignore */ }
  }


  return signed;
}
