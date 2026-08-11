import { useEffect } from "react";
import { useSection } from "@/lib/cms";

export type FontOption = { label: string; family: string; google?: string; stack: string };

export const FONT_OPTIONS: FontOption[] = [
  { label: "Playfair Display (serif)", family: "Playfair Display", google: "Playfair+Display:wght@400;500;600;700;800", stack: `"Playfair Display", ui-serif, Georgia, serif` },
  { label: "Cormorant Garamond (serif)", family: "Cormorant Garamond", google: "Cormorant+Garamond:wght@300;400;500;600;700", stack: `"Cormorant Garamond", ui-serif, Georgia, serif` },
  { label: "Lora (serif)", family: "Lora", google: "Lora:wght@400;500;600;700", stack: `"Lora", ui-serif, Georgia, serif` },
  { label: "Libre Baskerville (serif)", family: "Libre Baskerville", google: "Libre+Baskerville:wght@400;700", stack: `"Libre Baskerville", ui-serif, Georgia, serif` },
  { label: "Marcellus (display serif)", family: "Marcellus", google: "Marcellus", stack: `"Marcellus", ui-serif, Georgia, serif` },
  { label: "Instrument Serif (display)", family: "Instrument Serif", google: "Instrument+Serif:ital@0;1", stack: `"Instrument Serif", ui-serif, Georgia, serif` },
  { label: "Inter (sans)", family: "Inter", google: "Inter:wght@300;400;500;600;700", stack: `"Inter", ui-sans-serif, system-ui, sans-serif` },
  { label: "Work Sans (sans)", family: "Work Sans", google: "Work+Sans:wght@300;400;500;600", stack: `"Work Sans", ui-sans-serif, system-ui, sans-serif` },
  { label: "Manrope (sans)", family: "Manrope", google: "Manrope:wght@300;400;500;600;700", stack: `"Manrope", ui-sans-serif, system-ui, sans-serif` },
  { label: "DM Sans (sans)", family: "DM Sans", google: "DM+Sans:wght@300;400;500;600;700", stack: `"DM Sans", ui-sans-serif, system-ui, sans-serif` },
  { label: "Karla (sans)", family: "Karla", google: "Karla:wght@300;400;500;600;700", stack: `"Karla", ui-sans-serif, system-ui, sans-serif` },
  { label: "Space Grotesk (sans)", family: "Space Grotesk", google: "Space+Grotesk:wght@300;400;500;600;700", stack: `"Space Grotesk", ui-sans-serif, system-ui, sans-serif` },
];

export function findFont(family: string | undefined | null) {
  if (!family) return undefined;
  return FONT_OPTIONS.find((f) => f.family === family);
}

export type TypographySettings = {
  headingFont?: string;
  bodyFont?: string;
  baseSize?: string; // px, e.g. "17"
  headingScale?: string; // multiplier, e.g. "1.05"
};

/** Loads + applies admin-chosen fonts sitewide. */
export function useTypography() {
  const { data } = useSection<TypographySettings>("site", "typography");
  const c = data?.content;

  useEffect(() => {
    if (typeof document === "undefined") return;
    const heading = findFont(c?.headingFont);
    const body = findFont(c?.bodyFont);
    const families = [heading, body].filter(Boolean).map((f) => `family=${f!.google}`);

    const id = "cms-typography-fonts";
    document.getElementById(id)?.remove();
    if (families.length) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap`;
      document.head.appendChild(link);
    }

    const root = document.documentElement;
    if (heading) root.style.setProperty("--font-serif", heading.stack);
    else root.style.removeProperty("--font-serif");
    if (body) root.style.setProperty("--font-sans", body.stack);
    else root.style.removeProperty("--font-sans");

    const size = Number(c?.baseSize);
    if (size >= 12 && size <= 24) root.style.fontSize = `${size}px`;
    else root.style.fontSize = "";

    const scale = Number(c?.headingScale);
    root.style.setProperty("--heading-scale", scale > 0.5 && scale < 2 ? String(scale) : "1");
  }, [c?.headingFont, c?.bodyFont, c?.baseSize, c?.headingScale]);
}
