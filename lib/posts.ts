export type Locale = "pt-BR" | "en";

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
  /**
   * Optional. If set in the EN frontmatter, points to the slug of the PT post
   * that is the canonical source. Used for rel=canonical and the locale
   * toggle. If omitted, we assume slugs match across locales.
   */
  canonical?: string;
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

// Eager-load all markdown under content/posts/<locale>/*.md.
// Vite rewrites this glob at build time into a static object map.
const postFiles = import.meta.glob("/content/posts/*/*.md", {
  query: "?raw",
  eager: true,
  import: "default",
}) as Record<string, string>;

function parsePath(path: string): { locale: Locale; slug: string } | null {
  const m = path.match(/^\/content\/posts\/([^/]+)\/(.+)\.md$/);
  if (!m) return null;
  const [, loc, slug] = m;
  if (loc !== "pt-BR" && loc !== "en") return null;
  return { locale: loc, slug };
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
    canonical: asString(attributes.canonical) || undefined,
    content: body,
  };
}

export function getPostBySlug(slug: string, locale: Locale): Post | null {
  const path = `/content/posts/${locale}/${slug}.md`;
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
 * Given a post slug in one locale, return the equivalent slug in the other
 * locale. Matches by the `canonical` frontmatter field when present; falls
 * back to assuming the slug is the same across locales (and returns it only
 * if a file with that slug actually exists in the target locale).
 */
export function getTranslatedSlug(
  slug: string,
  fromLocale: Locale,
  toLocale: Locale,
): string | null {
  if (fromLocale === toLocale) return slug;

  // Case 1: moving from a locale to its canonical (PT)
  if (toLocale === "pt-BR") {
    // If the source file has `canonical`, that IS the PT slug.
    const source = getPostBySlug(slug, fromLocale);
    if (source?.canonical) return source.canonical;
  }

  // Case 2: moving from PT → another locale
  if (fromLocale === "pt-BR") {
    // Find a post in the target locale whose canonical points here.
    for (const p of getAllPosts(toLocale)) {
      if (p.canonical === slug) return p.slug;
    }
  }

  // Fallback: assume slug is the same across locales (only if it exists).
  return getPostBySlug(slug, toLocale) ? slug : null;
}
