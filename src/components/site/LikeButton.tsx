import { Heart } from "lucide-react";
import { useLikes, useToggleLike } from "@/lib/engagement";

export function LikeButton({
  itemId,
  count,
  liked,
  label = "Like",
}: {
  itemId: string;
  count?: number;
  liked?: boolean;
  label?: string;
}) {
  const needsData = count === undefined || liked === undefined;
  const { data } = useLikes(needsData ? [itemId] : []);
  const toggle = useToggleLike();

  const resolvedCount = count ?? data?.counts?.[itemId] ?? 0;
  const resolvedLiked = liked ?? data?.mine?.has(itemId) ?? false;

  return (
    <button
      type="button"
      aria-label={resolvedLiked ? "Unlike" : label}
      disabled={toggle.isPending}
      onClick={() => toggle.mutate({ itemId, liked: resolvedLiked })}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition disabled:opacity-60 ${
        resolvedLiked
          ? "border-gold bg-gold/10 text-gold"
          : "border-border/60 text-muted-foreground hover:border-gold/60 hover:text-cream"
      }`}
    >
      <Heart className={`h-3.5 w-3.5 ${resolvedLiked ? "fill-current" : ""}`} />
      <span>{resolvedCount > 0 ? resolvedCount : label}</span>
    </button>
  );
}
