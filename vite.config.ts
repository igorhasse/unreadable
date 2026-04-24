import { defineConfig, type Plugin } from "vite";
import vinext from "vinext";
import tailwindcss from "@tailwindcss/vite";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SITE_URL = process.env.VITE_SITE_URL || "https://igorhasse.com";
const SITE_TITLES: Record<Locale, string> = {
  "pt-BR": "igor hasse",
  "en": "igor hasse",
};
const SITE_DESCS: Record<Locale, string> = {
  "pt-BR": "Notas públicas de Igor Hasse sobre editores, tipos e sistemas.",
  "en": "Public notes by Igor Hasse on editors, type systems, and software.",
};

type Locale = "pt-BR" | "en";
type PostMeta = { slug: string; title: string; date: string; description: string };

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function rfc822(date: string): string {
  const d = date ? new Date(date) : new Date();
  return (Number.isNaN(d.getTime()) ? new Date() : d).toUTCString();
}

function readPosts(locale: Locale): PostMeta[] {
  const dir = join("content/posts", locale);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const raw = readFileSync(join(dir, file), "utf-8");
      const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
      const attrs: Record<string, string> = {};
      if (match) {
        for (const line of match[1].split("\n")) {
          const idx = line.indexOf(":");
          if (idx > 0) attrs[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
        }
      }
      return {
        slug,
        title: attrs.title || slug,
        date: attrs.date || "",
        description: attrs.description || "",
      };
    })
    .sort((a, b) => (a.date > b.date ? -1 : 1));
}

function buildRssXml(posts: PostMeta[], locale: Locale): string {
  // PT lives at the root; EN at /en. Feed URL and post URLs mirror that.
  const urlPrefix = locale === "en" ? `${SITE_URL}/en` : SITE_URL;
  const feedPath = `${urlPrefix}/rss.xml`;
  const lastBuild = rfc822(posts[0]?.date || "");
  const items = posts
    .map(
      (p) => `
    <item>
      <title>${esc(p.title)}</title>
      <link>${urlPrefix}/posts/${p.slug}</link>
      <guid>${urlPrefix}/posts/${p.slug}</guid>
      <pubDate>${rfc822(p.date)}</pubDate>
      <description>${esc(p.description)}</description>
    </item>`,
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE_TITLES[locale])}</title>
    <link>${urlPrefix}</link>
    <description>${esc(SITE_DESCS[locale])}</description>
    <language>${locale}</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${feedPath}" rel="self" type="application/rss+xml"/>${items}
  </channel>
</rss>`;
}

function writeRss(): void {
  const publicDir = "public";
  if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true });
  // PT feed at the root — /rss.xml
  writeFileSync(join(publicDir, "rss.xml"), buildRssXml(readPosts("pt-BR"), "pt-BR"));
  // EN feed nested — /en/rss.xml
  const enDir = join(publicDir, "en");
  if (!existsSync(enDir)) mkdirSync(enDir, { recursive: true });
  writeFileSync(join(enDir, "rss.xml"), buildRssXml(readPosts("en"), "en"));
}

function rssPlugin(): Plugin {
  return {
    name: "blog:rss",
    buildStart() {
      writeRss();
    },
    configureServer(server) {
      writeRss();
      server.watcher.add("content/posts/**/*.md");
      server.watcher.on("change", (file) => {
        if (file.includes("content/posts")) writeRss();
      });
      server.watcher.on("add", (file) => {
        if (file.includes("content/posts")) writeRss();
      });
      server.watcher.on("unlink", (file) => {
        if (file.includes("content/posts")) writeRss();
      });
    },
  };
}

export default defineConfig({
  plugins: [vinext(), tailwindcss(), rssPlugin()],
  build: {
    rollupOptions: {
      output: {
        // Force a stable filename for the main CSS bundle. _document.tsx
        // references it explicitly because vinext 0.0.43 doesn't auto-emit
        // <link rel=stylesheet> for _app.tsx's CSS chunk in Pages Router SSR.
        // Drop this once vinext collectAssetTags includes _app's assets.
        assetFileNames: (assetInfo) => {
          const name = assetInfo.names?.[0] ?? "";
          if (name.endsWith(".css")) return "assets/app.css";
          return "assets/[name]-[hash][extname]";
        },
      },
    },
  },
});
