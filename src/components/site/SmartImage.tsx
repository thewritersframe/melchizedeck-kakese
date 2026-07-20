import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ImageIcon, Loader2 } from "lucide-react";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string | null | undefined;
  fallbackLabel?: string;
  maxRetries?: number;
  wrapperClassName?: string;
};

/**
 * Image with automatic retry-on-error (exponential backoff, cache-busting query),
 * a loading shimmer, and a graceful fallback so broken placeholders never appear.
 */
export function SmartImage({
  src,
  alt = "",
  className,
  fallbackLabel,
  maxRetries = 4,
  wrapperClassName,
  ...rest
}: Props) {
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setAttempt(0);
    setStatus(src ? "loading" : "error");
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [src]);

  if (!src || status === "error") {
    return (
      <div className={cn("flex h-full w-full items-center justify-center bg-background/60 p-4 text-center", wrapperClassName)}>
        {fallbackLabel ? (
          <span className="font-serif text-lg text-gold/70">{fallbackLabel}</span>
        ) : (
          <ImageIcon className="h-6 w-6 text-muted-foreground/60" />
        )}
      </div>
    );
  }

  const finalSrc = attempt === 0 ? src : `${src}${src.includes("?") ? "&" : "?"}r=${attempt}`;

  return (
    <div className={cn("relative h-full w-full", wrapperClassName)}>
      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/40">
          <Loader2 className="h-5 w-5 animate-spin text-gold/60" />
        </div>
      )}
      <img
        {...rest}
        src={finalSrc}
        alt={alt}
        className={cn(className, status === "loading" && "opacity-0")}
        onLoad={() => setStatus("loaded")}
        onError={() => {
          if (attempt < maxRetries) {
            const next = attempt + 1;
            timerRef.current = window.setTimeout(() => {
              setAttempt(next);
              setStatus("loading");
            }, 400 * next);
          } else {
            setStatus("error");
          }
        }}
      />
    </div>
  );
}
