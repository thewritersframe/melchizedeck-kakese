export const SITE_URL = "https://melchizedeck-kakese.vercel.app";
export const SITE_NAME = "Melchizedeck Kakese";

export const SAME_AS = [
  "https://www.instagram.com/melchizedeckkakese",
  "https://www.threads.com/@melchizedeckkakese",
  "https://www.facebook.com/meckie06",
  "https://www.linkedin.com/in/melchizedeck-kakese-89a8b42b3",
  "https://linktr.ee/melchizedeckkakese",
];

type PageSeo = {
  path: string;
  title: string;
  description: string;
  type?: string;
  image?: string;
  jsonLd?: Record<string, unknown>[];
};

/** Builds per-route head(): title, description, OG/Twitter, self-canonical, JSON-LD. */
export function pageHead({ path, title, description, type = "website", image, jsonLd }: PageSeo) {
  const url = `${SITE_URL}${path === "/" ? "/" : path}`;
  const meta: Record<string, string>[] = [
    { title },
    { name: "description", content: description },
    { name: "robots", content: "index, follow" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:type", content: type },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
  if (image) {
    meta.push({ property: "og:image", content: image }, { name: "twitter:image", content: image });
  }
  return {
    meta,
    links: [{ rel: "canonical", href: url }],
    scripts: (jsonLd ?? []).map((d) => ({
      type: "application/ld+json",
      children: JSON.stringify({ "@context": "https://schema.org", ...d }),
    })),
  };
}

export const PERSON_LD = {
  "@type": "Person",
  "@id": `${SITE_URL}/#person`,
  name: "Melchizedeck Kakese",
  url: `${SITE_URL}/`,
  jobTitle: "Author, Screenwriter & Youth Advocate",
  description:
    "Tanzanian author, screenwriter and youth advocate, and founder of The Writer's Frame, using storytelling for social impact.",
  sameAs: SAME_AS,
};

export const WEBSITE_LD = {
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  publisher: { "@id": `${SITE_URL}/#person` },
};
