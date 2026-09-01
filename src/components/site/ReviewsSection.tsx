import { useState } from "react";
import { Star, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useAddReview,
  useReviews,
  useDeleteEngagement,
} from "@/lib/engagement";
import { useIsAdmin } from "@/lib/cms";
import { Stars } from "@/components/site/Stars";

export function ReviewsSection({ itemId }: { itemId: string }) {
  const { data: reviews } = useReviews(itemId);
  const { data: isAdmin } = useIsAdmin();

  const add = useAddReview(itemId);
  const del = useDeleteEngagement("content_reviews");

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");

  const average =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) /
        reviews.length
      : 0;

  const submit = () => {
    if (name.trim().length < 2) {
      return toast.error("Please add your name.");
    }

    if (rating < 1 || rating > 5) {
      return toast.error("Please choose a rating.");
    }

    if (body.trim().length < 2) {
      return toast.error("Please write a review.");
    }

    add.mutate(
      {
        name,
        rating,
        body,
      },
      {
        onSuccess: () => {
          setName("");
          setRating(0);
          setBody("");
          toast.success("Review posted — thank you!");
        },
        onError: (e: Error) => toast.error(e.message),
      },
    );
  };

  return (
    <div className="mt-6">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5 text-xs text-muted-foreground transition hover:border-gold/60 hover:text-cream"
      >
        <Star className="h-3.5 w-3.5" />
        {reviews?.length
          ? `${reviews.length} review${reviews.length > 1 ? "s" : ""}`
          : "Review"}
      </button>

      {open && (
        <div className="mt-5 rounded-lg border border-border/50 bg-card/50 p-4 backdrop-blur">
          {/* Average rating */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <Stars value={average} size={18} />

            <div>
              <span className="text-lg font-semibold text-cream">
                {average > 0 ? average.toFixed(1) : "No rating"}
              </span>

              {reviews && reviews.length > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  {reviews.length}{" "}
                  {reviews.length === 1 ? "review" : "reviews"}
                </span>
              )}
            </div>
          </div>

          {/* Review form */}
          <div className="rounded-lg border border-border/40 bg-background/20 p-4">
            <h3 className="text-sm font-medium text-cream">
              Share your review
            </h3>

            <div className="mt-4 grid gap-3">
              <Input
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={80}
              />

              <div>
                <p className="mb-2 text-xs text-muted-foreground">
                  Your rating
                </p>

                <Stars
                  value={rating}
                  size={22}
                  onChange={setRating}
                />
              </div>

              <Textarea
                placeholder="Share your thoughts…"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                maxLength={4000}
                rows={4}
              />
            </div>

            <div className="mt-3">
              <Button
                size="sm"
                className="bg-gold text-primary-foreground hover:opacity-90"
                disabled={add.isPending}
                onClick={submit}
              >
                {add.isPending && (
                  <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                )}
                Submit review
              </Button>
            </div>
          </div>

          {/* Reviews */}
          <div className="mt-6 space-y-4">
            {reviews?.map((review) => (
              <div
                key={review.id}
                className="border-t border-border/40 pt-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-cream">
                      {review.name}
                    </p>

                    <div className="mt-1">
                      <Stars value={review.rating} size={14} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] uppercase tracking-widest text-muted-foreground/70">
                      {new Date(review.created_at).toLocaleDateString(
                        undefined,
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </span>

                    {isAdmin && (
                      <button
                        aria-label="Delete review"
                        onClick={() => del.mutate(review.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {review.body && (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                    {review.body}
                  </p>
                )}
              </div>
            ))}

            {reviews?.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Be the first to leave a review.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
          }
