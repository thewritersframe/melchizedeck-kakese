// Selcom API Gateway client — server only (blocked from client bundle by filename).
// Signing algorithm mirrors Selcom's official PHP client
// (selcompaytechltd/selcom-apigw-client-php / src/apigwClient.php) exactly:
//
//   Authorization   : "SELCOM " + Base64(apiKey)
//   Timestamp       : ISO-8601
//   Signed-Fields   : comma-separated payload keys, in insertion order
//   signing string  : "timestamp=<ts>&<key1>=<val1>&<key2>=<val2>..."
//   Digest          : Base64( HMAC_SHA256(signing_string, apiSecret) )
//   Digest-Method   : "HS256"
//
// Endpoint: POST https://apigw.selcommobile.com/v1/checkout/create-order
// Response: { resultcode:"000", result:"SUCCESS", data:[{ payment_gateway_url:"<base64 url>" }] }

import { createHmac } from "crypto";
import { getRequestHeader } from "@tanstack/react-start/server";

const SELCOM_BASE = "https://apigw.selcommobile.com";

export type SelcomOrderInput = {
  order_id: string;
  buyer_email: string;
  buyer_name?: string;
  buyer_phone?: string;
  amount: number;
  currency: string;
  payment_methods?: string;
  redirect_url?: string;
  cancel_url?: string;
  webhook?: string;
  buyer_remarks?: string;
  merchant_remarks?: string;
  no_of_items?: number;
};

export type SelcomCreds = {
  vendorId: string;
  apiKey: string;
  apiSecret: string;
};

/** Reads Selcom credentials from the environment. Returns null if any are missing. */
export function readSelcomCreds(): SelcomCreds | null {
  const vendorId = process.env.SELCOM_VENDOR_ID;
  const apiKey = process.env.SELCOM_API_KEY;
  const apiSecret = process.env.SELCOM_API_SECRET;
  if (!vendorId || !apiKey || !apiSecret) return null;
  return { vendorId, apiKey, apiSecret };
}

function computeHeaders(apiKey: string, apiSecret: string, data: Record<string, unknown>) {
  const keys = Object.keys(data);
  const signedFields = keys.join(",");
  const timestamp = new Date().toISOString();
  let signingString = `timestamp=${timestamp}`;
  for (const k of keys) signingString += `&${k}=${String(data[k])}`;
  const digest = createHmac("sha256", apiSecret).update(signingString).digest("base64");
  const authorization = `SELCOM ${Buffer.from(apiKey).toString("base64")}`;
  return {
    "Content-Type": "application/json",
    Authorization: authorization,
    "Digest-Method": "HS256",
    Digest: digest,
    Timestamp: timestamp,
    "Signed-Fields": signedFields,
  };
}

/** Derives the public origin of the current request for webhook/redirect URLs. */
function getOrigin(): string {
  const origin = getRequestHeader("origin");
  if (origin) return origin.replace(/\/$/, "");
  const host = getRequestHeader("host");
  const proto = getRequestHeader("x-forwarded-proto") ?? "https";
  if (host) return `${proto}://${host}`.replace(/\/$/, "");
  return "";
}

export function buildReturnUrls(orderRef: string): {
  webhook: string;
  redirect_url: string;
  cancel_url: string;
} {
  const origin = getOrigin();
  if (!origin) {
    // Last-resort fallback to the published domain. The buyer is only redirected
    // here if request headers don't reveal the origin (very rare on the live site).
    const base = "https://melchizedeck-kakese.lovable.app";
    return {
      webhook: `${base}/api/public/selcom/webhook`,
      redirect_url: `${base}/unlock?ref=${orderRef}`,
      cancel_url: `${base}/`,
    };
  }
  return {
    webhook: `${origin}/api/public/selcom/webhook`,
    redirect_url: `${origin}/unlock?ref=${orderRef}`,
    cancel_url: `${origin}/`,
  };
}

/**
 * Creates a hosted Selcom checkout order and returns the gateway URL the buyer
 * must be redirected to. Throws a descriptive error if Selcom rejects the order.
 */
export async function createSelcomCheckoutOrder(
  input: SelcomOrderInput,
  creds: SelcomCreds,
): Promise<{ checkoutUrl: string; reference: string | null }> {
  // Only flat fields are signed (matches the PHP client). Nested billing/shipping
  // are optional and omitted here — the redirect_url + webhook drive the flow.
  const payload: Record<string, unknown> = {
    vendor: creds.vendorId,
    order_id: input.order_id,
    buyer_email: input.buyer_email,
    buyer_name: input.buyer_name ?? "",
    buyer_phone: input.buyer_phone ?? "",
    amount: input.amount,
    currency: input.currency,
    payment_methods: input.payment_methods ?? "ALL",
    redirect_url: input.redirect_url ?? "",
    cancel_url: input.cancel_url ?? "",
    webhook: input.webhook ?? "",
    buyer_remarks: input.buyer_remarks ?? "None",
    merchant_remarks: input.merchant_remarks ?? "None",
    no_of_items: input.no_of_items ?? 1,
  };

  const headers = computeHeaders(creds.apiKey, creds.apiSecret, payload);
  const res = await fetch(`${SELCOM_BASE}/v1/checkout/create-order`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  let body: Record<string, unknown> | null = null;
  try { body = JSON.parse(text) as Record<string, unknown>; } catch { /* non-json */ }

  if (!res.ok || !body) {
    throw new Error(`Selcom order failed (${res.status}): ${text.slice(0, 300)}`);
  }

  const result = String(body.result ?? "").toUpperCase();
  const code = String(body.resultcode ?? "");
  const dataArr = Array.isArray(body.data) ? (body.data as Record<string, unknown>[]) : [];
  const first = dataArr[0] ?? {};
  let url = String(first.payment_gateway_url ?? first.payment_token ?? "");
  // Selcom returns payment_gateway_url base64-encoded; decode if it isn't already a URL.
  if (url && !/^https?:\/\//i.test(url)) {
    try {
      const decoded = Buffer.from(url, "base64").toString("utf8");
      if (/^https?:\/\//i.test(decoded)) url = decoded;
    } catch { /* keep raw */ }
  }

  if (result !== "SUCCESS" && code !== "000") {
    throw new Error(`Selcom rejected order: ${String(body.message ?? body.result ?? text.slice(0, 200))}`);
  }
  if (!url) throw new Error("Selcom did not return a payment URL");

  const reference = (body.reference as string | undefined) ?? (first.gateway_buyer_uuid as string | undefined) ?? null;
  return { checkoutUrl: url, reference };
}
