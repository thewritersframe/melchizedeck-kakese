import { Heart } from "lucide-react";
import { useToggleLike } from "@/lib/engagement";

export function LikeButton({
  itemId,
  count,
  liked,
  label = "Like",
}: {
  itemId: string;
  count: number;
  liked: boolean;
  label?: string;
}) {
  const toggle = useToggleLike();
  return (
    <button
      type="button"
      aria-label={liked ? "Unlike" : label}
      disabled={toggle.isPending}
      onClick={() => toggle.mutate({ itemId, liked })}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition disabled:opacity-60 ${
        liked
          ? "border-gold bg-gold/10 text-gold"
          : "border-border/60 text-muted-foreground hover:border-gold/60 hover:text-cream"
      }`}
    >
      <Heart className={`h-3.5 w-3.5 ${liked ? "fill-current" : ""}`} />
      <span>{count > 0 ? count : label}</span>
    </button>
  );
}
