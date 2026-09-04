import { createServerFn } from "@tanstack/react-start";

export type SocialCounts = {
  instagram: number;
  linkedin: number;
  facebook: number;
  threads: number;
  whatsapp: number;
};

export type SocialFollowersResult = {
  counts: SocialCounts;
  total: number;
  live: string[];
};

const KEYS: (keyof SocialCounts)[] = ["instagram", "linkedin", "facebook", "threads", "whatsapp"];

function toNumber(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : Number(String(value ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? Math.round(n) : fallback;
}

/**
 * Returns the follower count per platform plus a total that is always summed at
 * runtime (never hard-coded). Counts stored in the CMS act as the baseline and
 * are refreshed from official platform APIs whenever access tokens are present.
 */
export const getSocialFollowers = createServerFn({ method: "GET" })
  .inputValidator((input: { baseline?: Partial<Record<keyof SocialCounts, unknown>> } | undefined) => input ?? {})
  .handler(async ({ data }): Promise<SocialFollowersResult> => {
    const counts: SocialCounts = {
      instagram: toNumber(data.baseline?.instagram, 0),
      linkedin: toNumber(data.baseline?.linkedin, 0),
      facebook: toNumber(data.baseline?.facebook, 0),
      threads: toNumber(data.baseline?.threads, 0),
      whatsapp: toNumber(data.baseline?.whatsapp, 0),
    };
    const live: string[] = [];

    // Instagram + Threads via the Instagram Graph API (needs a long-lived token).
    const igToken = process.env["INSTAGRAM_ACCESS_TOKEN"];
    const igUserId = process.env["INSTAGRAM_USER_ID"];
    if (igToken && igUserId) {
      try {
        const res = await fetch(
          `https://graph.facebook.com/v20.0/${igUserId}?fields=followers_count&access_token=${igToken}`,
        );
        const json = (await res.json()) as { followers_count?: number };
        if (typeof json.followers_count === "number") {
          counts.instagram = json.followers_count;
          live.push("instagram");
        }
      } catch {
        /* keep baseline */
      }
    }

    // Facebook Page followers.
    const fbToken = process.env["FACEBOOK_ACCESS_TOKEN"];
    const fbPageId = process.env["FACEBOOK_PAGE_ID"];
    if (fbToken && fbPageId) {
      try {
        const res = await fetch(
          `https://graph.facebook.com/v20.0/${fbPageId}?fields=followers_count,fan_count&access_token=${fbToken}`,
        );
        const json = (await res.json()) as { followers_count?: number; fan_count?: number };
        const n = json.followers_count ?? json.fan_count;
        if (typeof n === "number") {
          counts.facebook = n;
          live.push("facebook");
        }
      } catch {
        /* keep baseline */
      }
    }

    // LinkedIn organization follower statistics (needs an approved LinkedIn app).
    const liToken = process.env["LINKEDIN_ACCESS_TOKEN"];
    const liOrgId = process.env["LINKEDIN_ORG_ID"];
    if (liToken && liOrgId) {
      try {
        const res = await fetch(
          `https://api.linkedin.com/rest/networkSizes/urn:li:organization:${liOrgId}?edgeType=CompanyFollowedByMember`,
          { headers: { Authorization: `Bearer ${liToken}`, "LinkedIn-Version": "202405" } },
        );
        const json = (await res.json()) as { firstDegreeSize?: number };
        if (typeof json.firstDegreeSize === "number") {
          counts.linkedin = json.firstDegreeSize;
          live.push("linkedin");
        }
      } catch {
        /* keep baseline */
      }
    }

    const total = KEYS.reduce((sum, k) => sum + (counts[k] || 0), 0);
    return { counts, total, live };
  });
