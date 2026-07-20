import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function makeFetch(key: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(init?.headers);
    if ((key.startsWith("sb_")) && headers.get("Authorization") === `Bearer ${key}`) {
      headers.delete("Authorization");
    }
    headers.set("apikey", key);
    return fetch(input, { ...init, headers });
  };
}

function serverClient() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: { fetch: makeFetch(key) },
  });
}

function normEmail(e: string) {
  return e.trim().toLowerCase();
}

/** Public: create a pending purchase and return an order reference the client can present to Selcom. */
export const startCheckout = createServerFn({ method: "POST" })
  .inputValidator((d: { email: string; phone?: string; itemId: string }) => d)
  .handler(async ({ data }) => {
    const email = normEmail(data.email);
    if (!email.includes("@")) throw new Error("Enter a valid email");
    if (!data.itemId) throw new Error("Missing item");

    const supabase = serverClient();
    const { data: item, error: itemErr } = await supabase
      .from("content_items")
      .select("id, title, collection, meta, published")
      .eq("id", data.itemId)
      .maybeSingle();
    if (itemErr || !item || !item.published) throw new Error("Item not available");

    const { data: settings } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "payments")
      .maybeSingle();
    const pay = (settings?.value ?? {}) as {
      standard_price?: number;
      currency?: string;
    };
    const amount = Number(pay.standard_price ?? 10000);
    const currency = pay.currency ?? "TZS";

    // Load admin client only after basic validation
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: purchase, error } = await supabaseAdmin
      .from("purchases")
      .insert({
        email,
        phone: data.phone ?? null,
        item_id: item.id,
        item_title: item.title,
        amount,
        currency,
        provider: "selcom",
        status: "pending",
      })
      .select("id, order_ref, amount, currency")
      .single();
    if (error) throw new Error(error.message);

    // TODO: Once SELCOM_VENDOR_ID / SELCOM_API_KEY / SELCOM_API_SECRET are set,
    // call Selcom Checkout API here to create a session and return its payment URL.
    // For now we return a placeholder so the UI can show a "Complete payment" state.
    const checkoutUrl: string | null = null;

    return {
      orderRef: purchase.order_ref,
      amount: purchase.amount,
      currency: purchase.currency,
      checkoutUrl,
      pending: true,
    };
  });

/** Public: list unlocked item ids for a given email (only currently valid unlocks). */
export const listUnlocks = createServerFn({ method: "POST" })
  .inputValidator((d: { email: string }) => d)
  .handler(async ({ data }) => {
    const email = normEmail(data.email);
    if (!email.includes("@")) return { itemIds: [] as string[], bundleExpiresAt: null as string | null };
    const supabase = serverClient();
    const { data: rows } = await supabase
      .from("unlocks")
      .select("item_id, expires_at")
      .eq("email", email);
    const now = Date.now();
    const itemIds = (rows ?? [])
      .filter((r) => !r.expires_at || new Date(r.expires_at).getTime() > now)
      .map((r) => r.item_id);

    const { data: bundle } = await supabase
      .from("purchases")
      .select("bundle_expires_at")
      .eq("email", email)
      .eq("status", "paid")
      .order("bundle_expires_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const be = bundle?.bundle_expires_at;
    const bundleActive = be && new Date(be).getTime() > now ? be : null;
    return { itemIds, bundleExpiresAt: bundleActive };
  });

/** Public: within a bundle window, claim one extra free unlock. */
export const claimBundlePick = createServerFn({ method: "POST" })
  .inputValidator((d: { email: string; itemId: string }) => d)
  .handler(async ({ data }) => {
    const email = normEmail(data.email);
    if (!email.includes("@") || !data.itemId) throw new Error("Invalid request");

    const supabase = serverClient();
    const { data: settings } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "payments")
      .maybeSingle();
    const pay = (settings?.value ?? {}) as { bundle_free_picks?: number };
    const freePicks = Math.max(0, Number(pay.bundle_free_picks ?? 1));

    const { data: bundle } = await supabase
      .from("purchases")
      .select("id, bundle_expires_at")
      .eq("email", email)
      .eq("status", "paid")
      .order("bundle_expires_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!bundle?.bundle_expires_at || new Date(bundle.bundle_expires_at).getTime() < Date.now()) {
      throw new Error("Your bundle window has ended");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await supabaseAdmin
      .from("unlocks")
      .select("id", { count: "exact", head: true })
      .eq("email", email)
      .eq("source", "bundle");
    if ((count ?? 0) >= freePicks) throw new Error(`You've already claimed your ${freePicks} free pick(s)`);

    const { error } = await supabaseAdmin
      .from("unlocks")
      .insert({ email, item_id: data.itemId, source: "bundle" });
    if (error && !/duplicate key/i.test(error.message)) throw new Error(error.message);

    return { ok: true };
  });
