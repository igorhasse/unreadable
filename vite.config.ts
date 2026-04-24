import { defineConfig, type Plugin } from "vite";
import vinext from "vinext";
import tailwindcss from "@tailwindcss/vite";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
  copyFileSync,
} from "node:fs";
import { join, extname } from "node:path";

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

const ASSET_EXTENSIONS = new Set([
  ".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg",
  ".mp4", ".webm", ".mov",
  ".pdf",
]);

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
  const dir = "content/posts";
  if (!existsSync(dir)) return [];
  const results: PostMeta[] = [];
  for (const slug of readdirSync(dir)) {
    const bundleDir = join(dir, slug);
    if (!statSync(bundleDir).isDirectory()) continue;
    const file = join(bundleDir, `${locale}.md`);
    if (!existsSync(file)) continue;
    const raw = readFileSync(file, "utf-8");
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    const attrs: Record<string, string> = {};
    if (match) {
      for (const line of match[1].split("\n")) {
        const idx = line.indexOf(":");
        if (idx > 0) attrs[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
      }
    }
    results.push({
      slug,
      title: attrs.title || slug,
      date: attrs.date || "",
      description: attrs.description || "",
    });
  }
  return results.sort((a, b) => (a.date > b.date ? -1 : 1));
}

function buildRssXml(posts: PostMeta[], locale: Locale): string {
  const urlPrefix = locale === "en" ? `${SITE_URL}/en` : `${SITE_URL}/pt-BR`;
  const feedPath = locale === "en" ? `${SITE_URL}/en/rss.xml` : `${SITE_URL}/rss.xml`;
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
  writeFileSync(join(publicDir, "rss.xml"), buildRssXml(readPosts("pt-BR"), "pt-BR"));
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
      const onChange = (file: string) => {
        if (file.includes("content/posts")) writeRss();
      };
      server.watcher.on("change", onChange);
      server.watcher.on("add", onChange);
      server.watcher.on("unlink", onChange);
    },
  };
}

/**
 * Content-bundle assets plugin.
 * Copies any non-.md file under content/posts/<slug>/ to public/posts/<slug>/
 * so markdown references like `./diagram.png` resolve at /posts/<slug>/diagram.png.
 * Runs at buildStart and reacts to dev-server file changes.
 */
function assetsPlugin(): Plugin {
  function copyAll() {
    const dir = "content/posts";
    if (!existsSync(dir)) return;
    for (const slug of readdirSync(dir)) {
      const bundleDir = join(dir, slug);
      if (!statSync(bundleDir).isDirectory()) continue;
      const targetDir = join("public", "posts", slug);
      for (const file of readdirSync(bundleDir)) {
        const ext = extname(file).toLowerCase();
        if (!ASSET_EXTENSIONS.has(ext)) continue;
        if (!existsSync(targetDir)) mkdirSync(targetDir, { recursive: true });
        copyFileSync(join(bundleDir, file), join(targetDir, file));
      }
    }
  }

  return {
    name: "blog:content-assets",
    buildStart() {
      copyAll();
    },
    configureServer(server) {
      copyAll();
      const onChange = (file: string) => {
        if (file.includes("content/posts")) copyAll();
      };
      server.watcher.on("change", onChange);
      server.watcher.on("add", onChange);
      server.watcher.on("unlink", onChange);
    },
  };
}

export default defineConfig({
  plugins: [vinext(), tailwindcss(), rssPlugin(), assetsPlugin()],
});
