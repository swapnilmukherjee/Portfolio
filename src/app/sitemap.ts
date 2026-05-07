import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://swapnilmukherjee.vercel.app";
  return [
    { url: base, lastModified: new Date(), priority: 1.0, changeFrequency: "monthly" },
  ];
}
