import type { ContentItem } from "@/lib/cms";

export function latestFirst(items: ContentItem[]) {
  const timestamp = (item: ContentItem) => {
    const date = typeof item.meta?.date === "string" ? Date.parse(item.meta.date) : NaN;
    return Number.isFinite(date) ? date : Date.parse(item.created_at) || 0;
  };
  return [...items].sort((a, b) => timestamp(b) - timestamp(a) || Date.parse(b.created_at) - Date.parse(a.created_at) || a.id.localeCompare(b.id));
}