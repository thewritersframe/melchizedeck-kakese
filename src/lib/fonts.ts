import { useEffect } from "react";
import { useSection } from "@/lib/cms";

export type FontGroup = "Serif" | "Sans" | "Display" | "Handwritten";
export type FontOption = { label: string; family: string; google?: string; stack: string; group: FontGroup };

export const FONT_OPTIONS: FontOption[] = [
  // Serif
  { label: "Playfair Display", family: "Playfair Display", google: "Playfair+Display:wght@400;500;600;700;800", stack: `"Playfair Display", ui-serif, Georgia, serif`, group: "Serif" },
  { label: "Cormorant Garamond", family: "Cormorant Garamond", google: "Cormorant+Garamond:wght@300;400;500;600;700", stack: `"Cormorant Garamond", ui-serif, Georgia, serif`, group: "Serif" },
  { label: "Lora", family: "Lora", google: "Lora:wght@400;500;600;700", stack: `"Lora", ui-serif, Georgia, serif`, group: "Serif" },
  { label: "Libre Baskerville", family: "Libre Baskerville", google: "Libre+Baskerville:wght@400;700", stack: `"Libre Baskerville", ui-serif, Georgia, serif`, group: "Serif" },
  { label: "EB Garamond", family: "EB Garamond", google: "EB+Garamond:wght@400;500;600;700", stack: `"EB Garamond", ui-serif, Georgia, serif`, group: "Serif" },
  { label: "Crimson Pro", family: "Crimson Pro", google: "Crimson+Pro:wght@300;400;600;700", stack: `"Crimson Pro", ui-serif, Georgia, serif`, group: "Serif" },
  { label: "Spectral", family: "Spectral", google: "Spectral:wght@300;400;500;600;700", stack: `"Spectral", ui-serif, Georgia, serif`, group: "Serif" },
  { label: "Marcellus", family: "Marcellus", google: "Marcellus", stack: `"Marcellus", ui-serif, Georgia, serif`, group: "Serif" },

  // Sans
  { label: "Inter", family: "Inter", google: "Inter:wght@300;400;500;600;700", stack: `"Inter", ui-sans-serif, system-ui, sans-serif`, group: "Sans" },
  { label: "Work Sans", family: "Work Sans", google: "Work+Sans:wght@300;400;500;600", stack: `"Work Sans", ui-sans-serif, system-ui, sans-serif`, group: "Sans" },
  { label: "Manrope", family: "Manrope", google: "Manrope:wght@300;400;500;600;700", stack: `"Manrope", ui-sans-serif, system-ui, sans-serif`, group: "Sans" },
  { label: "DM Sans", family: "DM Sans", google: "DM+Sans:wght@300;400;500;600;700", stack: `"DM Sans", ui-sans-serif, system-ui, sans-serif`, group: "Sans" },
  { label: "Karla", family: "Karla", google: "Karla:wght@300;400;500;600;700", stack: `"Karla", ui-sans-serif, system-ui, sans-serif`, group: "Sans" },
  { label: "Space Grotesk", family: "Space Grotesk", google: "Space+Grotesk:wght@300;400;500;600;700", stack: `"Space Grotesk", ui-sans-serif, system-ui, sans-serif`, group: "Sans" },
  { label: "Outfit", family: "Outfit", google: "Outfit:wght@300;400;500;600;700", stack: `"Outfit", ui-sans-serif, system-ui, sans-serif`, group: "Sans" },
  { label: "Plus Jakarta Sans", family: "Plus Jakarta Sans", google: "Plus+Jakarta+Sans:wght@300;400;500;600;700", stack: `"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif`, group: "Sans" },
  { label: "Epilogue", family: "Epilogue", google: "Epilogue:wght@300;400;500;600;700", stack: `"Epilogue", ui-sans-serif, system-ui, sans-serif`, group: "Sans" },

  // Display
  { label: "Instrument Serif", family: "Instrument Serif", google: "Instrument+Serif:ital@0;1", stack: `"Instrument Serif", ui-serif, Georgia, serif`, group: "Display" },
  { label: "DM Serif Display", family: "DM Serif Display", google: "DM+Serif+Display:ital@0;1", stack: `"DM Serif Display", ui-serif, Georgia, serif`, group: "Display" },
  { label: "Abril Fatface", family: "Abril Fatface", google: "Abril+Fatface", stack: `"Abril Fatface", ui-serif, Georgia, serif`, group: "Display" },
  { label: "Bodoni Moda", family: "Bodoni Moda", google: "Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900", stack: `"Bodoni Moda", ui-serif, Georgia, serif`, group: "Display" },
  { label: "Fraunces", family: "Fraunces", google: "Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900", stack: `"Fraunces", ui-serif, Georgia, serif`, group: "Display" },
  { label: "Cinzel", family: "Cinzel", google: "Cinzel:wght@400;500;600;700;800", stack: `"Cinzel", ui-serif, Georgia, serif`, group: "Display" },
  { label: "Italiana", family: "Italiana", google: "Italiana", stack: `"Italiana", ui-serif, Georgia, serif`, group: "Display" },
  { label: "Prata", family: "Prata", google: "Prata", stack: `"Prata", ui-serif, Georgia, serif`, group: "Display" },
  { label: "Syne", family: "Syne", google: "Syne:wght@400;500;600;700;800", stack: `"Syne", ui-sans-serif, system-ui, sans-serif`, group: "Display" },
  { label: "Bebas Neue", family: "Bebas Neue", google: "Bebas+Neue", stack: `"Bebas Neue", ui-sans-serif, system-ui, sans-serif`, group: "Display" },
  { label: "Anton", family: "Anton", google: "Anton", stack: `"Anton", ui-sans-serif, system-ui, sans-serif`, group: "Display" },
  { label: "Archivo Black", family: "Archivo Black", google: "Archivo+Black", stack: `"Archivo Black", ui-sans-serif, system-ui, sans-serif`, group: "Display" },

  // Handwritten
  { label: "Dancing Script", family: "Dancing Script", google: "Dancing+Script:wght@400;500;600;700", stack: `"Dancing Script", ui-serif, cursive`, group: "Handwritten" },
  { label: "Great Vibes", family: "Great Vibes", google: "Great+Vibes", stack: `"Great Vibes", ui-serif, cursive`, group: "Handwritten" },
  { label: "Parisienne", family: "Parisienne", google: "Parisienne", stack: `"Parisienne", ui-serif, cursive`, group: "Handwritten" },
  { label: "Allura", family: "Allura", google: "Allura", stack: `"Allura", ui-serif, cursive`, group: "Handwritten" },
  { label: "Sacramento", family: "Sacramento", google: "Sacramento", stack: `"Sacramento", ui-serif, cursive`, group: "Handwritten" },
  { label: "Caveat", family: "Caveat", google: "Caveat:wght@400;500;600;700", stack: `"Caveat", ui-serif, cursive`, group: "Handwritten" },
  { label: "Satisfy", family: "Satisfy", google: "Satisfy", stack: `"Satisfy", ui-serif, cursive`, group: "Handwritten" },
  { label: "Pacifico", family: "Pacifico", google: "Pacifico", stack: `"Pacifico", ui-serif, cursive`, group: "Handwritten" },
  { label: "Kalam", family: "Kalam", google: "Kalam:wght@300;400;700", stack: `"Kalam", ui-serif, cursive`, group: "Handwritten" },
  { label: "Shadows Into Light", family: "Shadows Into Light", google: "Shadows+Into+Light", stack: `"Shadows Into Light", ui-serif, cursive`, group: "Handwritten" },
];

export const FONT_GROUPS: FontGroup[] = ["Serif", "Sans", "Display", "Handwritten"];

export function findFont(family: string | undefined | null) {
  if (!family) return undefined;
  return FONT_OPTIONS.find((f) => f.family === family);
}

export type TypographySettings = {
  headingFont?: string;
  bodyFont?: string;
  displayFont?: string; // big hero / page titles
  accentFont?: string; // eyebrows, quotes, signatures
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
