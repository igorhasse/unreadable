import type { MetadataRoute } from "next";
import { SITE, type Locale } from "../lib/site-config";
import { getAllPosts } from "../lib/posts";

const LOCALES: Locale[] = ["pt-BR", "en"];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    const prefix = `${SITE.url}/${locale}`;
    entries.push({ url: prefix, changeFrequency: "weekly", priority: 1 });
    entries.push({ url: `${prefix}/about`, changeFrequency: "monthly", priority: 0.6 });
    entries.push({ url: `${prefix}/rss`, changeFrequency: "yearly", priority: 0.3 });

    for (const post of getAllPosts(locale)) {
      entries.push({
        url: `${prefix}/posts/${post.slug}`,
        lastModified: post.date,
        changeFrequency: "monthly",
        priority: 0.8,
        alternates: {
          languages: {
            "pt-BR": `${SITE.url}/pt-BR/posts/${post.slug}`,
            "en": `${SITE.url}/en/posts/${post.slug}`,
          },
        },
      });
    }
  }

  return entries;
}
