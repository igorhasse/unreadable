import type { Locale } from "./site-config";

export type { Locale };

export interface PostMeta {
  slug: string;
  locale: Locale;
  title: string;
  date: string;
  dateHuman: string;
  readingTime: string;
  description: string;
  tags: string[];
  coverImage?: string;
}

export interface Post extends PostMeta {
  content: string;
}

type FrontmatterAttrs = Record<string, string | string[]>;

function parseFrontmatter(raw: string): { attributes: FrontmatterAttrs; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { attributes: {}, body: raw };

  const attributes: FrontmatterAttrs = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    const rawValue = line.slice(idx + 1).trim();
    if (rawValue.startsWith("[") && rawValue.endsWith("]")) {
      attributes[key] = rawValue
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    } else {
      attributes[key] = rawValue;
    }
  }
  return { attributes, body: match[2] };
}

const MONTHS_PT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDate(iso: string, locale: Locale): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const day = String(d.getUTCDate()).padStart(2, "0");
  const months = locale === "en" ? MONTHS_EN : MONTHS_PT;
  const month = months[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  return `${day} ${month} ${year}`;
}

function readingTime(text: string, locale: Locale): string {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return locale === "en" ? `${minutes} min read` : `${minutes} min de leitura`;
}

function asString(v: string | string[] | undefined): string {
  return typeof v === "string" ? v : "";
}

function asArray(v: string | string[] | undefined): string[] {
  return Array.isArray(v) ? v : [];
}

// Content bundles: /content/posts/<slug>/<locale>.md
// Vite rewrites this glob at build time to a static object map.
const postFiles = import.meta.glob("/content/posts/*/*.md", {
  query: "?raw",
  eager: true,
  import: "default",
}) as Record<string, string>;

function parsePath(path: string): { slug: string; locale: Locale } | null {
  const m = path.match(/^\/content\/posts\/([^/]+)\/([^/]+)\.md$/);
  if (!m) return null;
  const [, slug, loc] = m;
  if (loc !== "pt-BR" && loc !== "en") return null;
  return { slug, locale: loc };
}

function buildPost(slug: string, locale: Locale, raw: string): Post {
  const { attributes, body } = parseFrontmatter(raw);
  const date = asString(attributes.date);
  return {
    slug,
    locale,
    title: asString(attributes.title) || slug,
    date,
    dateHuman: formatDate(date, locale),
    readingTime: readingTime(body, locale),
    description: asString(attributes.description),
    tags: asArray(attributes.tags),
    coverImage: asString(attributes.coverImage) || undefined,
    content: body,
  };
}

export function getPostBySlug(slug: string, locale: Locale): Post | null {
  const path = `/content/posts/${slug}/${locale}.md`;
  const raw = postFiles[path];
  if (!raw) return null;
  return buildPost(slug, locale, raw);
}

export function getAllPosts(locale: Locale): PostMeta[] {
  const posts: PostMeta[] = [];
  for (const [path, raw] of Object.entries(postFiles)) {
    const parsed = parsePath(path);
    if (!parsed || parsed.locale !== locale) continue;
    const { content: _content, ...meta } = buildPost(parsed.slug, parsed.locale, raw);
    posts.push(meta);
  }
  return posts.sort((a, b) => (a.date > b.date ? -1 : 1));
}

/**
 * With same-slug-across-locales convention, translation is a no-op when the
 * target file exists, null otherwise.
 */
export function getTranslatedSlug(
  slug: string,
  _fromLocale: Locale,
  toLocale: Locale,
): string | null {
  return getPostBySlug(slug, toLocale) ? slug : null;
}
