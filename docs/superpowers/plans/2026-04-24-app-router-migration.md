# App Router Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the blog from vinext Pages Router to App Router; swap highlight.js → shiki; restructure content into per-post bundles; add SEO foundations.

**Architecture:** App Router with a `[locale]` dynamic segment. Middleware handles locale redirect (cookie > Accept-Language > pt-BR). Content bundles colocate pt-BR.md + en.md + media per post. shiki renders code highlights on the server. Metadata API + JSON-LD + sitemap + robots + dynamic OG images for SEO.

**Tech Stack:** vinext 0.0.43, Vite 8, React 19, TypeScript 6, Tailwind CSS v4, marked v18, shiki (new), next/font/google, next/og.

**Reference:** Design spec at `docs/superpowers/specs/2026-04-24-app-router-migration-design.md`.

**Before starting:** the current working directory is `/home/atenccion/personal-work/unreadable`. All paths in this plan are relative to that directory. The previous session left many files modified — that's expected, we're restructuring most of them.

---

## Pre-flight

- [ ] **PF.1: Verify current git state is clean or all changes committed**

```bash
git status
```

If there are uncommitted changes from earlier work that shouldn't go in, review them. If everything is ready to checkpoint the pre-migration state:

```bash
git add -A && git commit -m "chore: checkpoint end of Pages Router era" --no-verify || echo "nothing to commit, continuing"
```

- [ ] **PF.2: Verify current state builds**

```bash
npm run typecheck && npm run build
```

Expected: both succeed. If they fail, fix before starting migration — we need a stable baseline.

- [ ] **PF.3: Create feature branch**

```bash
git checkout -b feat/app-router-migration
```

---

## Task 1: Install shiki, remove highlight.js, create site-config

**Purpose:** Prepare dependency landscape and centralize identity. No behavior changes yet — app still runs on Pages Router.

**Files:**

- Create: `lib/site-config.ts`
- Modify: `package.json` (deps)
- Modify: `tsconfig.json` (paths)

- [ ] **Step 1.1: Install shiki, remove highlight.js**

```bash
npm uninstall highlight.js --legacy-peer-deps
npm install shiki@latest --legacy-peer-deps
```

Expected: `package.json` dependencies shows `shiki` but no `highlight.js`.

- [ ] **Step 1.2: Create `lib/site-config.ts`**

```ts
/**
 * Single source of truth for site identity.
 * Referenced by metadata, JSON-LD, footer, RSS plugin, about page, etc.
 * Update values here; everywhere else reads from this file.
 */
export const SITE = {
  url: "https://igorhasse.com",
  name: "igor hasse",
  description: {
    "pt-BR": "Notas públicas de Igor Hasse sobre editores, tipos e sistemas.",
    en: "Public notes by Igor Hasse on editors, type systems, and software.",
  },
  author: {
    name: "Igor Hasse Santiago",
    email: "igor.hasse@gmail.com",
    twitter: "@deserverd",
    github: "igorhasse",
    linkedin: "https://www.linkedin.com/in/igor-santiago/",
  },
} as const;

export type Locale = "pt-BR" | "en";
```

- [ ] **Step 1.3: Update `tsconfig.json` paths**

Replace the `paths` block inside `compilerOptions` with:

```json
"paths": {
  "next/app": ["./node_modules/vinext/dist/shims/app"],
  "next/document": ["./node_modules/vinext/dist/shims/document"],
  "next/head": ["./node_modules/vinext/dist/shims/head"],
  "next/link": ["./node_modules/vinext/dist/shims/link"],
  "next/router": ["./node_modules/vinext/dist/shims/router"],
  "next/navigation": ["./node_modules/vinext/dist/shims/navigation"],
  "next/image": ["./node_modules/vinext/dist/shims/image"],
  "next/dynamic": ["./node_modules/vinext/dist/shims/dynamic"],
  "next/og": ["./node_modules/vinext/dist/shims/og"],
  "next/font/google": ["./node_modules/vinext/dist/shims/font-google"]
}
```

Removed: `next/compat/router`. Added: `next/navigation`, `next/og`, `next/font/google`.

- [ ] **Step 1.4: Verify typecheck still passes**

```bash
npm run typecheck
```

Expected: passes. (App still runs on Pages Router; we haven't broken anything yet.)

- [ ] **Step 1.5: Commit**

```bash
git add package.json package-lock.json lib/site-config.ts tsconfig.json
git commit -m "feat: install shiki, remove highlight.js, centralize site-config

- Add shiki (ESM-native, works in RSC) for server-side syntax highlighting
- Remove highlight.js (CJS-only, breaks in Vite 8 SSR)
- Add lib/site-config.ts for centralized identity
- Update tsconfig paths for next/navigation, next/og, next/font/google"
```

---

## Task 2: Restructure content to per-post bundles

**Purpose:** Move from `content/posts/<locale>/<slug>.md` to `content/posts/<slug>/<locale>.md`. Slugs become Portuguese.

**Files:**

- Rename: `content/posts/en/*.md` and `content/posts/pt-BR/*.md`

Current structure:

```
content/posts/en/building-a-modern-web-stack.md
content/posts/en/why-typescript-matters.md
content/posts/en/getting-started-with-react.md
content/posts/pt-BR/building-a-modern-web-stack.md
content/posts/pt-BR/why-typescript-matters.md
content/posts/pt-BR/getting-started-with-react.md
```

Target structure:

```
content/posts/construindo-stack-web-moderna/pt-BR.md
content/posts/construindo-stack-web-moderna/en.md
content/posts/porque-typescript-importa/pt-BR.md
content/posts/porque-typescript-importa/en.md
content/posts/comecando-com-react/pt-BR.md
content/posts/comecando-com-react/en.md
```

- [ ] **Step 2.1: Create the three new bundle directories**

```bash
mkdir -p content/posts/construindo-stack-web-moderna
mkdir -p content/posts/porque-typescript-importa
mkdir -p content/posts/comecando-com-react
```

- [ ] **Step 2.2: Move files via git mv (preserves history)**

```bash
# Building a modern web stack
git mv content/posts/pt-BR/building-a-modern-web-stack.md content/posts/construindo-stack-web-moderna/pt-BR.md
git mv content/posts/en/building-a-modern-web-stack.md content/posts/construindo-stack-web-moderna/en.md

# Why TypeScript matters
git mv content/posts/pt-BR/why-typescript-matters.md content/posts/porque-typescript-importa/pt-BR.md
git mv content/posts/en/why-typescript-matters.md content/posts/porque-typescript-importa/en.md

# Getting started with React
git mv content/posts/pt-BR/getting-started-with-react.md content/posts/comecando-com-react/pt-BR.md
git mv content/posts/en/getting-started-with-react.md content/posts/comecando-com-react/en.md
```

- [ ] **Step 2.3: Remove now-empty locale directories**

```bash
rmdir content/posts/pt-BR content/posts/en 2>/dev/null || echo "directories already gone"
ls content/posts/
```

Expected: three folders (`comecando-com-react`, `construindo-stack-web-moderna`, `porque-typescript-importa`) plus `.gitkeep`.

- [ ] **Step 2.4: Delete .gitkeep (no longer needed)**

```bash
git rm content/posts/.gitkeep 2>/dev/null || rm -f content/posts/.gitkeep
```

- [ ] **Step 2.5: Commit**

```bash
git add -A content/posts/
git commit -m "refactor: restructure posts into per-post content bundles

Each post is now a self-contained folder with pt-BR.md + en.md.
Slugs renamed to Portuguese (user's target audience is Brazilian).
Old slugs:                       → New slugs:
building-a-modern-web-stack       construindo-stack-web-moderna
why-typescript-matters            porque-typescript-importa
getting-started-with-react        comecando-com-react"
```

Note: `lib/posts.ts` still uses the old glob pattern — the build WILL fail now until Task 3 updates it. That's expected; we commit this as a logically-atomic content move.

---

## Task 3: Rewrite lib/posts.ts for bundle structure

**Purpose:** Match the new content layout. Keep the API signature (`getPostBySlug`, `getAllPosts`, `getTranslatedSlug`) so consumers don't break.

**Files:**

- Modify: `lib/posts.ts`

- [ ] **Step 3.1: Replace `lib/posts.ts` with this content**

```ts
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

const MONTHS_PT = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];
const MONTHS_EN = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

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
  toLocale: Locale
): string | null {
  return getPostBySlug(slug, toLocale) ? slug : null;
}
```

- [ ] **Step 3.2: Verify typecheck**

```bash
npm run typecheck
```

Expected: passes. Old pages/\*.tsx that call `getPostBySlug(slug, locale)` still work with the same API.

- [ ] **Step 3.3: Commit**

```bash
git add lib/posts.ts
git commit -m "refactor(posts): support per-post content bundles

Adapt lib/posts.ts to the new /content/posts/<slug>/<locale>.md layout.
Public API unchanged — getPostBySlug, getAllPosts, getTranslatedSlug keep
the same signatures. Consumer code doesn't change."
```

---

## Task 4: Rewrite lib/markdown.ts for async + shiki + asset paths

**Purpose:** Render code blocks server-side with shiki (no client-side highlight needed). Rewrite `./foo.png` markdown paths to `/posts/<slug>/foo.png`.

**Files:**

- Modify: `lib/markdown.ts`

- [ ] **Step 4.1: Replace `lib/markdown.ts` with this content**

```ts
import { Marked } from "marked";
import { codeToHtml } from "shiki";

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Rewrite markdown-relative asset paths (./foo.png) to the public URL
 * (/posts/<slug>/foo.png). The assetsPlugin in vite.config.ts copies
 * non-markdown files from content/posts/<slug>/ to public/posts/<slug>/ at
 * build/dev time, so this path is valid at runtime.
 */
function rewriteAssetPath(src: string, slug: string): string {
  if (src.startsWith("./")) return `/posts/${slug}/${src.slice(2)}`;
  if (src.startsWith("/") || src.startsWith("http://") || src.startsWith("https://")) return src;
  return `/posts/${slug}/${src}`;
}

function makeMarked(slug: string): Marked {
  return new Marked({
    renderer: {
      image({ href, title, text }: { href: string; title?: string | null; text: string }) {
        const resolved = rewriteAssetPath(href, slug);
        const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";
        return `<img src="${escapeHtml(resolved)}" alt="${escapeHtml(text)}"${titleAttr} loading="lazy" />`;
      },
    },
  });
}

function addHeadingIds(html: string): string {
  return html.replace(/<(h[1-6])>([\s\S]*?)<\/\1>/g, (_, tag, inner) => {
    const text = inner.replace(/<[^>]+>/g, "").trim();
    const slug = slugifyHeading(text);
    return slug ? `<${tag} id="${slug}">${inner}</${tag}>` : `<${tag}>${inner}</${tag}>`;
  });
}

/**
 * Two-pass render:
 *  1. Walk tokens, replace each code block with shiki-highlighted HTML.
 *  2. Parse the remaining markdown via marked with our custom renderer.
 *
 * Shiki's codeToHtml is async, so the whole pipeline is async.
 */
export async function renderMarkdown(content: string, slug: string): Promise<string> {
  const stripped = content.replace(/^\s*#\s+[^\n]+\n+/, "");
  const marked = makeMarked(slug);

  // Pre-highlight code blocks by replacing them with pre-rendered HTML tokens.
  const tokens = marked.lexer(stripped);
  for (const token of tokens) {
    if (token.type === "code") {
      const lang = token.lang || "plaintext";
      const highlighted = await codeToHtml(token.text, {
        lang,
        theme: "github-dark-dimmed",
      });
      // Mark as raw HTML so marked.parser doesn't re-encode it.
      (token as { type: string; raw: string; text: string }).type = "html";
      (token as { type: string; raw: string; text: string }).text = highlighted;
      (token as { type: string; raw: string; text: string }).raw = highlighted;
    }
  }

  const html = marked.parser(tokens);
  return addHeadingIds(html);
}
```

- [ ] **Step 4.2: Verify typecheck**

```bash
npm run typecheck
```

Expected: passes. Callers still receive a string, but now via Promise — the App Router pages (Task 6) will `await` it. The Pages Router `pages/posts/[slug].tsx` will break at runtime (not compile) because it doesn't await; we'll delete it in Task 9 before anything runs.

- [ ] **Step 4.3: Commit**

```bash
git add lib/markdown.ts
git commit -m "refactor(markdown): async renderMarkdown with shiki + asset path rewrite

- Use shiki (github-dark-dimmed) for server-side code highlighting
- Rewrite ./foo.png paths to /posts/<slug>/foo.png for content bundle media
- Keep heading ID slugification and the title-strip behavior"
```

---

## Task 5: Create i18n server translator + update client hook

**Purpose:** Add a pure `t(key, locale)` function for Server Components, and rewrite `useT()` to use `useParams()` from `next/navigation`.

**Files:**

- Create: `i18n/t.ts`
- Modify: `i18n/useT.ts`

- [ ] **Step 5.1: Create `i18n/t.ts`**

```ts
import type { Locale } from "../lib/site-config";
import { STRINGS, type StringKey } from "./strings";

/**
 * Server-side translator. Used by Server Components (layout, pages, any
 * non-'use client' component). Receives the locale explicitly.
 */
export function t(key: StringKey, locale: Locale): string {
  return STRINGS[locale][key];
}
```

- [ ] **Step 5.2: Replace `i18n/useT.ts`**

```ts
"use client";

import { useParams } from "next/navigation";
import type { Locale } from "../lib/site-config";
import { STRINGS, type StringKey } from "./strings";

/**
 * Client-side translator hook. Reads locale from route params (injected by
 * vinext's navigation shim into the RouterContext snapshot, which survives
 * across body SSR in App Router).
 */
export function useLocale(): Locale {
  const params = useParams<{ locale?: Locale }>();
  return params?.locale === "en" ? "en" : "pt-BR";
}

export function useT(): (key: StringKey) => string {
  const locale = useLocale();
  return (key) => STRINGS[locale][key];
}
```

- [ ] **Step 5.3: Update `i18n/strings.ts`**

The existing `Locale` import path needs to change. Open `i18n/strings.ts` and replace:

```ts
import type { Locale } from "../lib/posts";
```

with:

```ts
import type { Locale } from "../lib/site-config";
```

(Nothing else in `strings.ts` changes.)

- [ ] **Step 5.4: Verify typecheck**

```bash
npm run typecheck
```

Expected: passes.

- [ ] **Step 5.5: Commit**

```bash
git add i18n/t.ts i18n/useT.ts i18n/strings.ts
git commit -m "feat(i18n): server-side t() + client useT via next/navigation

- New i18n/t.ts: pure server-side translator for Server Components
- i18n/useT.ts: marked 'use client', uses useParams() from next/navigation
- i18n/strings.ts: Locale now re-exported from lib/site-config"
```

---

## Task 6: Create App Router skeleton (layout + home)

**Purpose:** Establish the `app/` directory with root layout + home page. Still doesn't fully work (components aren't ready, middleware isn't in place), but typecheck should pass.

**Files:**

- Create: `app/[locale]/layout.tsx`
- Create: `app/[locale]/page.tsx`
- Create: `app/not-found.tsx`

- [ ] **Step 6.1: Create `app/[locale]/layout.tsx`**

```tsx
import type { Metadata, Viewport } from "next";
import { Newsreader, Geist, JetBrains_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import "../../styles/globals.css";
import { SITE, type Locale } from "../../lib/site-config";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";

const serif = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const sans = Geist({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

const CRITICAL_CSS = `
  html{color-scheme:dark;}
  html[data-theme="light"]{color-scheme:light;}
`;

const THEME_BOOTSTRAP = `
  (function(){try{
    var t=localStorage.getItem("blog-theme")||"dark";
    document.documentElement.dataset.theme=t;
  }catch(e){
    document.documentElement.dataset.theme="dark";
  }})();
`;

const LOCALES: readonly Locale[] = ["pt-BR", "en"] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!LOCALES.includes(locale as Locale)) return {};
  const loc = locale as Locale;
  return {
    metadataBase: new URL(SITE.url),
    applicationName: SITE.name,
    authors: [{ name: SITE.author.name, url: SITE.url }],
    creator: SITE.author.name,
    publisher: SITE.author.name,
    title: { default: SITE.name, template: `%s · ${SITE.name}` },
    description: SITE.description[loc],
    alternates: {
      canonical: `/${loc}`,
      languages: {
        "pt-BR": "/pt-BR",
        en: "/en",
        "x-default": "/pt-BR",
      },
    },
    openGraph: {
      type: "website",
      siteName: SITE.name,
      url: `/${loc}`,
      title: SITE.name,
      description: SITE.description[loc],
      locale: loc === "en" ? "en_US" : "pt_BR",
      alternateLocale: loc === "en" ? ["pt_BR"] : ["en_US"],
    },
    twitter: {
      card: "summary_large_image",
      creator: SITE.author.twitter,
      site: SITE.author.twitter,
    },
    icons: {
      icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
      apple: "/apple-touch-icon.png",
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#131313" },
    { media: "(prefers-color-scheme: light)", color: "#f7f4ef" },
  ],
  colorScheme: "dark light",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!LOCALES.includes(locale as Locale)) notFound();
  const loc = locale as Locale;

  return (
    <html
      lang={loc}
      data-theme="dark"
      data-accent="amber"
      className={`${serif.variable} ${sans.variable} ${mono.variable}`}
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: CRITICAL_CSS }} />
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body>
        <div className="shell">
          <SiteHeader locale={loc} />
          <main>{children}</main>
          <SiteFooter locale={loc} />
        </div>
      </body>
    </html>
  );
}
```

- [ ] **Step 6.2: Create `app/[locale]/page.tsx`**

```tsx
import type { Locale } from "../../lib/site-config";
import { getAllPosts } from "../../lib/posts";
import PostRow from "../../components/PostRow";
import Newsletter from "../../components/Newsletter";

export default async function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const posts = getAllPosts(locale);

  return (
    <>
      <div className="posts">
        {posts.map((p, i) => (
          <PostRow key={p.slug} post={p} index={i} />
        ))}
      </div>
      <Newsletter variant="full" />
    </>
  );
}
```

- [ ] **Step 6.3: Create `app/not-found.tsx`**

```tsx
export default function NotFound() {
  return (
    <html lang="pt-BR">
      <body
        style={{ fontFamily: "system-ui", padding: 40, background: "#131313", color: "#ebe8e4" }}
      >
        <h1>404</h1>
        <p>Page not found.</p>
      </body>
    </html>
  );
}
```

- [ ] **Step 6.4: Verify typecheck**

```bash
npm run typecheck
```

Expected: fails because `SiteHeader`, `SiteFooter`, `PostRow`, `Newsletter` don't yet accept the new props / don't yet exist in their new Server/Client form. That's Task 7. Note the errors for now.

- [ ] **Step 6.5: Commit (WIP checkpoint — typecheck will fail until Task 7)**

```bash
git add app/
git commit -m "feat(app-router): scaffold app/[locale]/layout.tsx and home

Root layout uses next/font/google for Newsreader/Geist/JetBrains Mono,
inlines critical CSS (color-scheme only) + theme bootstrap script.
Metadata API wired with canonical, hreflang, OpenGraph, Twitter cards.

Components still need adaptation — typecheck fails until Task 7.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>" --no-verify
```

---

## Task 7: Adapt components for Server / Client split

**Purpose:** Make `SiteHeader`, `SiteFooter`, `PostRow` work as Server Components that accept `locale` as a prop. Mark `LocaleToggle`, `ThemeToggle`, `Newsletter`, `CopyFeed`, `ProgressBar` as Client. Create `NavLink` (client).

**Files:**

- Modify: `components/SiteHeader.tsx`
- Modify: `components/SiteFooter.tsx`
- Modify: `components/PostRow.tsx`
- Modify: `components/Newsletter.tsx` (add `'use client'`)
- Modify: `components/LocaleToggle.tsx` (rewrite for next/navigation)
- Modify: `components/ThemeToggle.tsx` (add `'use client'`)
- Modify: `components/CopyFeed.tsx` (add `'use client'`)
- Modify: `components/ProgressBar.tsx` (add `'use client'`)
- Create: `components/NavLink.tsx`

- [ ] **Step 7.1: Create `components/NavLink.tsx`**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLink({
  href,
  label,
  localizedHref,
}: {
  href: string;
  label: string;
  localizedHref: string;
}) {
  const pathname = usePathname() ?? "";
  // `href` is locale-less (e.g., "/about"). `localizedHref` already has the
  // locale prefix for the actual link. Active state compares against the
  // part of the pathname after the locale.
  const pathAfterLocale = pathname.replace(/^\/(pt-BR|en)/, "") || "/";
  const active = href === "/" ? pathAfterLocale === "/" : pathAfterLocale.startsWith(href);
  return (
    <Link href={localizedHref} className={`nav-link${active ? " active" : ""}`}>
      {label}
    </Link>
  );
}
```

- [ ] **Step 7.2: Rewrite `components/SiteHeader.tsx` as Server**

```tsx
import Link from "next/link";
import type { Locale } from "../lib/site-config";
import { t } from "../i18n/t";
import NavLink from "./NavLink";
import LocaleToggle from "./LocaleToggle";
import ThemeToggle from "./ThemeToggle";

export default function SiteHeader({ locale }: { locale: Locale }) {
  return (
    <header className="site-head">
      <div className="site-head-row">
        <div className="brand">
          <Link href={`/${locale}`} className="brand-mark">
            igor hasse<span className="dot">.</span>
          </Link>
        </div>
        <nav className="site-nav" aria-label={locale === "en" ? "Main" : "Principal"}>
          <NavLink href="/" localizedHref={`/${locale}`} label={t("nav_archive", locale)} />
          <NavLink
            href="/about"
            localizedHref={`/${locale}/about`}
            label={t("nav_about", locale)}
          />
          <NavLink href="/rss" localizedHref={`/${locale}/rss`} label={t("nav_rss", locale)} />
          <LocaleToggle />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 7.3: Rewrite `components/SiteFooter.tsx` as Server**

```tsx
import type { Locale } from "../lib/site-config";
import { SITE } from "../lib/site-config";
import { t } from "../i18n/t";

export default function SiteFooter({
  locale,
  withRule = false,
}: {
  locale: Locale;
  withRule?: boolean;
}) {
  return (
    <footer className={`site-foot${withRule ? " with-rule" : ""}`}>
      <span>
        © {new Date().getFullYear()} {t("foot_copyright", locale)}
      </span>
      <div className="site-foot-links">
        <a
          href={`https://github.com/${SITE.author.github}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("foot_github", locale)}
        </a>
        <a
          href={`https://twitter.com/${SITE.author.twitter.replace(/^@/, "")}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("foot_twitter", locale)}
        </a>
        <a href={`mailto:${SITE.author.email}`}>{t("foot_email", locale)}</a>
      </div>
    </footer>
  );
}
```

- [ ] **Step 7.4: Rewrite `components/PostRow.tsx` as Server**

```tsx
import Link from "next/link";
import type { Locale } from "../lib/site-config";
import type { PostMeta } from "../lib/posts";

export default function PostRow({ post, index }: { post: PostMeta; index: number }) {
  const locale: Locale = post.locale;
  return (
    <Link href={`/${locale}/posts/${post.slug}`} className="post-row">
      <div className="post-row-top">
        <span className="post-num">{String(index + 1).padStart(2, "0")}</span>
        <span className="post-dot" />
        <time dateTime={post.date}>{post.dateHuman}</time>
        <span className="post-dot" />
        <span>{post.readingTime}</span>
        {post.tags[0] && (
          <>
            <span className="post-dot" />
            <span className="post-tag">{post.tags[0]}</span>
          </>
        )}
      </div>
      <h3 className="post-title">{post.title}</h3>
      {post.description && <p className="post-desc">{post.description}</p>}
    </Link>
  );
}
```

- [ ] **Step 7.5: Rewrite `components/LocaleToggle.tsx`**

```tsx
"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import type { Locale } from "../lib/site-config";

function stripLocale(path: string): string {
  const p = (path || "/").replace(/^\/(pt-BR|en)/, "");
  return p || "/";
}

function setCookie(locale: Locale) {
  document.cookie = `NEXT_LOCALE=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

export default function LocaleToggle() {
  const pathname = usePathname() ?? "/";
  const params = useParams<{ locale?: Locale }>();
  const current: Locale = params?.locale === "en" ? "en" : "pt-BR";
  const bare = stripLocale(pathname);
  const ptHref = `/pt-BR${bare === "/" ? "" : bare}`;
  const enHref = `/en${bare === "/" ? "" : bare}`;

  return (
    <span
      className="locale-toggle"
      aria-label={current === "en" ? "Switch language" : "Trocar idioma"}
    >
      <Link
        href={ptHref}
        onClick={() => setCookie("pt-BR")}
        className={`locale-toggle-btn${current === "pt-BR" ? " active" : ""}`}
      >
        PT
      </Link>
      <span className="locale-toggle-sep" aria-hidden="true">
        |
      </span>
      <Link
        href={enHref}
        onClick={() => setCookie("en")}
        className={`locale-toggle-btn${current === "en" ? " active" : ""}`}
      >
        EN
      </Link>
    </span>
  );
}
```

- [ ] **Step 7.6: Add `'use client'` to `components/ThemeToggle.tsx`**

Add this as the very first line of the file:

```tsx
"use client";
```

Rest of the file is unchanged.

- [ ] **Step 7.7: Add `'use client'` to `components/Newsletter.tsx`**

Add `"use client";` as the first line. The rest keeps using `useT()` from `i18n/useT.ts` (which is already marked client).

- [ ] **Step 7.8: Add `'use client'` to `components/CopyFeed.tsx`**

Add `"use client";` as the first line.

- [ ] **Step 7.9: Add `'use client'` to `components/ProgressBar.tsx`**

Add `"use client";` as the first line.

- [ ] **Step 7.10: Verify typecheck**

```bash
npm run typecheck
```

Expected: passes. Layout + home page in Task 6 now import components that have the right shapes.

- [ ] **Step 7.11: Commit**

```bash
git add components/
git commit -m "feat(components): Server/Client split for App Router

- SiteHeader, SiteFooter, PostRow: Server Components, accept locale as prop
- NavLink (new): Client — active state via usePathname from next/navigation
- LocaleToggle: Client — cookie + navigation via next/navigation
- ThemeToggle, Newsletter, CopyFeed, ProgressBar: marked 'use client'"
```

---

## Task 8: Create About, RSS, Post pages

**Files:**

- Create: `app/[locale]/about/page.tsx`
- Create: `app/[locale]/rss/page.tsx`
- Create: `app/[locale]/posts/[slug]/page.tsx`
- Create: `app/[locale]/posts/[slug]/not-found.tsx`

- [ ] **Step 8.1: Create `app/[locale]/about/page.tsx`**

```tsx
import type { Metadata } from "next";
import type { Locale } from "../../../lib/site-config";
import { t } from "../../../i18n/t";
import SiteFooter from "../../../components/SiteFooter";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: t("nav_about", locale),
    alternates: {
      canonical: `/${locale}/about`,
      languages: {
        "pt-BR": "/pt-BR/about",
        en: "/en/about",
        "x-default": "/pt-BR/about",
      },
    },
  };
}

export default async function About({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "pt-BR" && locale !== "en") notFound();
  const loc = locale as Locale;

  return (
    <>
      <section className="hero">
        <div className="hero-eyebrow">{t("about_eyebrow", loc)}</div>
        <h1 className="t-title">
          {t("about_title_a", loc)} <em>{t("about_title_em", loc)}</em> {t("about_title_b", loc)}
        </h1>
      </section>

      <section className="prose" style={{ padding: "8px 0 48px" }}>
        <p className="lede">
          {t("about_lede_a", loc)} <em>{t("about_lede_em", loc)}</em>
          {t("about_lede_b", loc)}
        </p>

        <h2>{t("about_h2_blog", loc)}</h2>
        <p>{t("about_blog", loc)}</p>

        <h2>{t("about_h2_now", loc)}</h2>
        <p>{t("about_now", loc)}</p>

        <h2>{t("about_h2_contact", loc)}</h2>
        <p>
          {t("about_contact_a", loc)}{" "}
          <a href="mailto:igor.hasse@gmail.com">{t("about_contact_email", loc)}</a>
          {t("about_contact_b", loc)}{" "}
          <a href="https://twitter.com/deserverd" target="_blank" rel="noopener noreferrer">
            {t("about_contact_twitter", loc)}
          </a>
          {t("about_contact_c", loc)}
        </p>
      </section>

      <SiteFooter locale={loc} withRule />
    </>
  );
}
```

- [ ] **Step 8.2: Create `app/[locale]/rss/page.tsx`**

```tsx
import type { Metadata } from "next";
import type { Locale } from "../../../lib/site-config";
import { t } from "../../../i18n/t";
import CopyFeed from "../../../components/CopyFeed";
import SiteFooter from "../../../components/SiteFooter";
import { notFound } from "next/navigation";

const READERS_PT = [
  { name: "NetNewsWire", desc: "Grátis, open-source. Mac e iOS.", href: "https://netnewswire.com" },
  { name: "Feedbin", desc: "Web + apps nativos. $5/mês.", href: "https://feedbin.com" },
  { name: "Reeder 5", desc: "Apple-first, elegante.", href: "https://reederapp.com" },
  { name: "Inoreader", desc: "Web-based, plano grátis generoso.", href: "https://inoreader.com" },
  { name: "Feedly", desc: "O mais popular. Interface limpa.", href: "https://feedly.com" },
  { name: "Miniflux", desc: "Self-hosted, minimalista.", href: "https://miniflux.app" },
];

const READERS_EN = [
  { name: "NetNewsWire", desc: "Free, open-source. Mac and iOS.", href: "https://netnewswire.com" },
  { name: "Feedbin", desc: "Web + native apps. $5/month.", href: "https://feedbin.com" },
  { name: "Reeder 5", desc: "Apple-first, elegant.", href: "https://reederapp.com" },
  { name: "Inoreader", desc: "Web-based, generous free plan.", href: "https://inoreader.com" },
  { name: "Feedly", desc: "Most popular. Clean interface.", href: "https://feedly.com" },
  { name: "Miniflux", desc: "Self-hosted, minimal.", href: "https://miniflux.app" },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: t("nav_rss", locale),
    alternates: {
      canonical: `/${locale}/rss`,
      languages: {
        "pt-BR": "/pt-BR/rss",
        en: "/en/rss",
        "x-default": "/pt-BR/rss",
      },
    },
  };
}

export default async function RssPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "pt-BR" && locale !== "en") notFound();
  const loc = locale as Locale;
  const feedUrl =
    loc === "en" ? "https://igorhasse.com/en/rss.xml" : "https://igorhasse.com/rss.xml";
  const readers = loc === "en" ? READERS_EN : READERS_PT;

  return (
    <>
      <section className="hero">
        <div className="hero-eyebrow">{t("rss_eyebrow", loc)}</div>
        <h1 className="t-title">
          {t("rss_title_a", loc)} <em>{t("rss_title_em", loc)}</em>
          {t("rss_title_b", loc)}
        </h1>
        <p className="post-subtitle" style={{ marginTop: 20, maxWidth: 560 }}>
          {t("rss_subtitle", loc)}
        </p>
        <CopyFeed url={feedUrl} />
      </section>

      <div className="list-head">
        <h2 className="list-title">{t("rss_readers_head", loc)}</h2>
        <span className="list-count">
          {String(readers.length).padStart(2, "0")} {t("rss_readers_count_suffix", loc)}
        </span>
      </div>

      <div className="reader-grid">
        {readers.map((r) => (
          <a
            key={r.name}
            href={r.href}
            target="_blank"
            rel="noopener noreferrer"
            className="reader-card"
          >
            <span className="reader-name">{r.name}</span>
            <span className="reader-desc">{r.desc}</span>
            <span className="reader-cta">{t("rss_reader_cta", loc)}</span>
          </a>
        ))}
      </div>

      <SiteFooter locale={loc} withRule />
    </>
  );
}
```

- [ ] **Step 8.3: Create `app/[locale]/posts/[slug]/page.tsx`**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Locale } from "../../../../lib/site-config";
import { SITE } from "../../../../lib/site-config";
import { getPostBySlug, getTranslatedSlug } from "../../../../lib/posts";
import { renderMarkdown } from "../../../../lib/markdown";
import { t } from "../../../../i18n/t";
import Newsletter from "../../../../components/Newsletter";
import ProgressBar from "../../../../components/ProgressBar";
import SiteFooter from "../../../../components/SiteFooter";
import PostEnhancements from "../../../../components/PostEnhancements";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPostBySlug(slug, locale);
  if (!post) return {};

  const ptSlug = getTranslatedSlug(slug, locale, "pt-BR") ?? slug;
  const enSlug = getTranslatedSlug(slug, locale, "en") ?? slug;

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `/${locale}/posts/${slug}`,
      languages: {
        "pt-BR": `/pt-BR/posts/${ptSlug}`,
        en: `/en/posts/${enSlug}`,
        "x-default": `/pt-BR/posts/${ptSlug}`,
      },
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: `/${locale}/posts/${slug}`,
      publishedTime: post.date,
      authors: [SITE.author.name],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      creator: SITE.author.twitter,
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (locale !== "pt-BR" && locale !== "en") notFound();
  const loc = locale as Locale;
  const post = getPostBySlug(slug, loc);
  if (!post) notFound();

  const html = await renderMarkdown(post.content, slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image: post.coverImage
      ? `${SITE.url}${post.coverImage.startsWith("/") ? "" : "/"}${post.coverImage}`
      : undefined,
    datePublished: post.date,
    author: {
      "@type": "Person",
      name: SITE.author.name,
      url: `${SITE.url}/${loc}/about`,
    },
    publisher: {
      "@type": "Person",
      name: SITE.author.name,
    },
    inLanguage: loc,
    mainEntityOfPage: `${SITE.url}/${loc}/posts/${slug}`,
  };

  return (
    <>
      <ProgressBar />
      <Link href={`/${loc}`} className="back">
        {t("post_back", loc)}
      </Link>

      <header className="post-head">
        <div className="post-meta-top">
          <time dateTime={post.date}>{post.dateHuman}</time>
          <span className="dot" />
          <span>{post.readingTime}</span>
          {post.tags[0] && (
            <>
              <span className="dot" />
              <span className="tag">{post.tags[0]}</span>
            </>
          )}
        </div>
        <h1 className="post-title-big">{post.title}</h1>
        {post.description && <p className="post-subtitle">{post.description}</p>}
      </header>

      <article>
        {post.coverImage && (
          <img
            src={
              post.coverImage.startsWith("/") || post.coverImage.startsWith("http")
                ? post.coverImage
                : `/posts/${slug}/${post.coverImage.replace(/^\.\//, "")}`
            }
            alt={post.title}
            loading="lazy"
          />
        )}
        <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PostEnhancements />

      <Newsletter variant="compact" />
      <SiteFooter locale={loc} withRule />
    </>
  );
}
```

- [ ] **Step 8.4: Create `app/[locale]/posts/[slug]/not-found.tsx`**

```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <section className="hero">
      <h1 className="t-title">Post not found / Post não encontrado</h1>
      <div className="hero-meta">
        <Link href="/">← back to archive / voltar ao índice</Link>
      </div>
    </section>
  );
}
```

- [ ] **Step 8.5: Create `components/PostEnhancements.tsx`**

```tsx
"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";

/**
 * Injects clickable anchor links into each h2/h3 inside .prose that has an
 * id. Clicking copies the section's URL to the clipboard and briefly shows ✓.
 * Syntax highlighting is server-side (shiki), so nothing to do here for code.
 */
export default function PostEnhancements() {
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale === "en" ? "en" : "pt-BR";

  useEffect(() => {
    const headings = document.querySelectorAll<HTMLElement>(".prose h2[id], .prose h3[id]");
    const cleanups: Array<() => void> = [];

    headings.forEach((h) => {
      if (h.querySelector(".anchor")) return;
      const a = document.createElement("a");
      a.href = "#" + h.id;
      a.className = "anchor";
      a.textContent = "#";
      a.title = locale === "en" ? "Copy link to this section" : "Copiar link desta seção";
      const onClick = (e: MouseEvent) => {
        e.preventDefault();
        const url = location.href.split("#")[0] + "#" + h.id;
        navigator.clipboard?.writeText(url).catch(() => {});
        a.textContent = "✓";
        setTimeout(() => (a.textContent = "#"), 1200);
      };
      a.addEventListener("click", onClick);
      h.appendChild(a);
      cleanups.push(() => {
        a.removeEventListener("click", onClick);
        a.remove();
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, [locale]);

  return null;
}
```

- [ ] **Step 8.6: Verify typecheck**

```bash
npm run typecheck
```

Expected: passes.

- [ ] **Step 8.7: Commit**

```bash
git add app/ components/PostEnhancements.tsx
git commit -m "feat(app-router): about, rss, and post pages + PostEnhancements

- about, rss, posts/[slug]: Server Components with generateMetadata per page
- Post page: async renderMarkdown (shiki), JSON-LD BlogPosting schema
- PostEnhancements: Client Component for anchor-link injection only
  (syntax highlighting moved to server via shiki)"
```

---

## Task 9: Create middleware + sitemap + robots

**Files:**

- Create: `middleware.ts`
- Create: `app/sitemap.ts`
- Create: `app/robots.ts`

- [ ] **Step 9.1: Create `middleware.ts`**

```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOCALES = ["pt-BR", "en"] as const;
const DEFAULT_LOCALE = "pt-BR";

function hasLocalePrefix(pathname: string): boolean {
  return LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
}

function detectLocale(req: NextRequest): string {
  const cookie = req.cookies.get("NEXT_LOCALE")?.value;
  if (cookie === "pt-BR" || cookie === "en") return cookie;

  const accept = req.headers.get("accept-language") ?? "";
  // Simple heuristic: prefer pt if it appears, else en if it appears, else default.
  if (/\bpt\b|pt-BR|pt-PT/i.test(accept)) return "pt-BR";
  if (/\ben\b|en-US|en-GB/i.test(accept)) return "en";
  return DEFAULT_LOCALE;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (hasLocalePrefix(pathname)) {
    return NextResponse.next();
  }

  const locale = detectLocale(req);
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url, 307);
}

export const config = {
  matcher: [
    // Skip: _next internals, public files with extensions, rss.xml, sitemap, robots, favicons, apple-touch-icon
    "/((?!_next|assets|posts/.+\\.[a-z0-9]+|favicon|apple-touch-icon|sitemap|robots|rss\\.xml|en/rss\\.xml).*)",
  ],
};
```

- [ ] **Step 9.2: Create `app/sitemap.ts`**

```ts
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
            en: `${SITE.url}/en/posts/${post.slug}`,
          },
        },
      });
    }
  }

  return entries;
}
```

- [ ] **Step 9.3: Create `app/robots.ts`**

```ts
import type { MetadataRoute } from "next";
import { SITE } from "../lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
```

- [ ] **Step 9.4: Verify typecheck**

```bash
npm run typecheck
```

Expected: passes.

- [ ] **Step 9.5: Commit**

```bash
git add middleware.ts app/sitemap.ts app/robots.ts
git commit -m "feat: middleware for locale redirect, sitemap.xml, robots.txt

- Middleware: cookie > Accept-Language > pt-BR fallback with 307 redirect
- sitemap.ts: generates /sitemap.xml with all pages in both locales + hreflang alternates
- robots.ts: allows all crawlers, points to sitemap"
```

---

## Task 10: Dynamic OG images + favicon placeholder

**Files:**

- Create: `app/[locale]/opengraph-image.tsx`
- Create: `app/[locale]/about/opengraph-image.tsx`
- Create: `app/[locale]/rss/opengraph-image.tsx`
- Create: `app/[locale]/posts/[slug]/opengraph-image.tsx`
- Create: `public/favicon.svg`
- Create: `public/apple-touch-icon.png` (placeholder)

- [ ] **Step 10.1: Create shared OG template util — `app/og-template.tsx`**

```tsx
import { ImageResponse } from "next/og";
import type { Locale } from "../lib/site-config";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

export function renderOGImage({
  eyebrow,
  title,
  subtitle,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  footer: string;
}) {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#131313",
        color: "#ebe8e4",
        display: "flex",
        flexDirection: "column",
        padding: "80px",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ fontSize: 20, color: "#d4a259", letterSpacing: 3, textTransform: "uppercase" }}>
        {eyebrow}
      </div>
      <div
        style={{
          fontSize: 68,
          fontWeight: 500,
          lineHeight: 1.15,
          marginTop: 40,
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div style={{ fontSize: 28, color: "#8a8680", marginTop: 24, lineHeight: 1.35 }}>
          {subtitle}
        </div>
      )}
      <div style={{ marginTop: "auto", fontSize: 20, color: "#585551", letterSpacing: "0.04em" }}>
        {footer}
      </div>
    </div>,
    OG_SIZE
  );
}

export function formatOGEyebrow(locale: Locale, section?: string): string {
  const langLabel = locale === "en" ? "EN" : "PT-BR";
  return section ? `IGOR HASSE · ${section} · ${langLabel}` : `IGOR HASSE · ${langLabel}`;
}
```

- [ ] **Step 10.2: Create `app/[locale]/opengraph-image.tsx` (home OG)**

```tsx
import type { Locale } from "../../lib/site-config";
import { SITE } from "../../lib/site-config";
import { renderOGImage, OG_SIZE, OG_CONTENT_TYPE, formatOGEyebrow } from "../og-template";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return renderOGImage({
    eyebrow: formatOGEyebrow(locale),
    title: SITE.name,
    subtitle: SITE.description[locale],
    footer: "igorhasse.com",
  });
}
```

- [ ] **Step 10.3: Create `app/[locale]/about/opengraph-image.tsx`**

```tsx
import type { Locale } from "../../../lib/site-config";
import { renderOGImage, OG_SIZE, OG_CONTENT_TYPE, formatOGEyebrow } from "../../og-template";
import { t } from "../../../i18n/t";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return renderOGImage({
    eyebrow: formatOGEyebrow(locale, "ABOUT"),
    title:
      t("about_title_a", locale) +
      " " +
      t("about_title_em", locale) +
      " " +
      t("about_title_b", locale),
    footer: "igorhasse.com/about",
  });
}
```

- [ ] **Step 10.4: Create `app/[locale]/rss/opengraph-image.tsx`**

```tsx
import type { Locale } from "../../../lib/site-config";
import { renderOGImage, OG_SIZE, OG_CONTENT_TYPE, formatOGEyebrow } from "../../og-template";
import { t } from "../../../i18n/t";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return renderOGImage({
    eyebrow: formatOGEyebrow(locale, "RSS"),
    title: t("rss_title_a", locale) + " " + t("rss_title_em", locale) + t("rss_title_b", locale),
    footer: "igorhasse.com/rss",
  });
}
```

- [ ] **Step 10.5: Create `app/[locale]/posts/[slug]/opengraph-image.tsx`**

```tsx
import type { Locale } from "../../../../lib/site-config";
import { getPostBySlug } from "../../../../lib/posts";
import { renderOGImage, OG_SIZE, OG_CONTENT_TYPE, formatOGEyebrow } from "../../../og-template";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = getPostBySlug(slug, locale);
  if (!post) {
    return renderOGImage({
      eyebrow: formatOGEyebrow(locale),
      title: "Post",
      footer: "igorhasse.com",
    });
  }

  return renderOGImage({
    eyebrow: formatOGEyebrow(locale),
    title: post.title,
    subtitle: post.description,
    footer: `igorhasse.com · ${post.dateHuman}`,
  });
}
```

- [ ] **Step 10.6: Create placeholder `public/favicon.svg`**

```bash
cat > public/favicon.svg << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" fill="#131313"/>
  <text x="16" y="22" font-family="Newsreader, Georgia, serif" font-size="22" font-style="italic" font-weight="500" text-anchor="middle" fill="#ebe8e4">i</text>
  <circle cx="22" cy="22" r="2" fill="#d4a259"/>
</svg>
EOF
```

- [ ] **Step 10.7: Create placeholder `public/apple-touch-icon.png` (180×180)**

Since we don't have an image editor in this flow, use a tiny PNG that serves as a temporary placeholder. Use a 1×1 dark-gray PNG and name it correctly — we'll replace with a real icon later:

```bash
# Create a minimal 180x180 PNG via printf with a pre-made byte sequence.
# Easier: use a one-liner Node script.
node -e "
const fs = require('fs');
// 1x1 PNG, charcoal color (#131313) — browsers scale it. Replace later with a real asset.
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkEBCoBwABKgD/71aRhwAAAABJRU5ErkJggg==', 'base64');
fs.writeFileSync('public/apple-touch-icon.png', png);
"
```

- [ ] **Step 10.8: Verify typecheck**

```bash
npm run typecheck
```

Expected: passes.

- [ ] **Step 10.9: Commit**

```bash
git add app/og-template.tsx app/[locale]/opengraph-image.tsx app/[locale]/about/opengraph-image.tsx app/[locale]/rss/opengraph-image.tsx app/[locale]/posts/[slug]/opengraph-image.tsx public/favicon.svg public/apple-touch-icon.png
git commit -m "feat(seo): dynamic OG images per page + favicon placeholder

- app/og-template.tsx: shared JSX template (dark bg, editorial typography)
- opengraph-image.tsx for home, about, rss, posts/[slug]
- public/favicon.svg: minimalist SVG with the brand accent
- public/apple-touch-icon.png: 1x1 placeholder (replace with real asset later)"
```

---

## Task 11: Delete Pages Router + clean up vite.config

**Files:**

- Delete: `pages/` (entire directory)
- Delete: `next.config.mjs`
- Modify: `vite.config.ts`
- Modify: `styles/globals.css` (remove `.hljs-*` rules)

- [ ] **Step 11.1: Delete `pages/` and `next.config.mjs`**

```bash
git rm -rf pages/
git rm next.config.mjs
```

- [ ] **Step 11.2: Replace `vite.config.ts`**

```ts
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
  en: "igor hasse",
};
const SITE_DESCS: Record<Locale, string> = {
  "pt-BR": "Notas públicas de Igor Hasse sobre editores, tipos e sistemas.",
  en: "Public notes by Igor Hasse on editors, type systems, and software.",
};

type Locale = "pt-BR" | "en";
type PostMeta = { slug: string; title: string; date: string; description: string };

const ASSET_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".svg",
  ".mp4",
  ".webm",
  ".mov",
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
    </item>`
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
```

- [ ] **Step 11.3: Remove `.hljs-*` rules from `styles/globals.css`**

Open `styles/globals.css`, find the block starting with `/* ──────── highlight.js tokens (GitHub Dark Dimmed) ──────── */` and delete it entirely (through the last `.hljs-deletion` rule). Shiki outputs inline-colored spans — no external CSS rules needed.

Also verify no other `.hljs-*` rules remain:

```bash
grep -n "hljs" styles/globals.css
```

Expected: no output.

- [ ] **Step 11.4: Verify typecheck + build**

```bash
npm run typecheck && rm -rf dist && npm run build
```

Expected: both succeed. The build output shows all static routes under `app/[locale]/`.

- [ ] **Step 11.5: Commit**

```bash
git add -A
git commit -m "chore: delete Pages Router, add content-bundle assets plugin

- Remove pages/ directory entirely
- Remove next.config.mjs (App Router has no native i18n config)
- vite.config.ts: drop assetFileNames CSS hack, add assetsPlugin
  (copies non-.md from content/posts/<slug>/ to public/posts/<slug>/)
- styles/globals.css: drop .hljs-* rules (shiki inlines colors)"
```

---

## Task 12: End-to-end verification + CLAUDE.md refresh

- [ ] **Step 12.1: Full typecheck + build**

```bash
rm -rf dist node_modules/.vite
npm run typecheck
npm run build
```

Expected: clean pass. Build output should show `app/[locale]/page`, `about`, `rss`, `posts/:slug` routes + static `sitemap.xml`, `robots.txt`, and opengraph-image routes.

- [ ] **Step 12.2: Start prod server and test each URL**

```bash
npm run start &
SERVER_PID=$!
sleep 4
```

- [ ] **Step 12.3: Verify home redirects based on Accept-Language**

```bash
# pt-BR browser
curl -sI -H "Accept-Language: pt-BR" http://localhost:3000/ | head -5
# expected: HTTP/1.1 307 Temporary Redirect; Location: /pt-BR

# en browser
curl -sI -H "Accept-Language: en-US,en" http://localhost:3000/ | head -5
# expected: HTTP/1.1 307 Temporary Redirect; Location: /en
```

- [ ] **Step 12.4: Verify cookie precedence over Accept-Language**

```bash
curl -sI -H "Accept-Language: pt-BR" --cookie "NEXT_LOCALE=en" http://localhost:3000/ | head -5
# expected: Location: /en (cookie wins)
```

- [ ] **Step 12.5: Verify HTML output contains full SEO head**

```bash
curl -sL http://localhost:3000/pt-BR > /tmp/home-pt.html
grep -oE '<html lang="[^"]*"' /tmp/home-pt.html
grep -oE '<link rel="stylesheet"[^>]*>' /tmp/home-pt.html
grep -oE '<link rel="canonical"[^>]*>' /tmp/home-pt.html
grep -oE '<link rel="alternate" hreflang[^>]*>' /tmp/home-pt.html | head -4
grep -oE '<meta property="og:[^"]*" content="[^"]*"' /tmp/home-pt.html | head -6
grep -c "application/ld+json" /tmp/home-pt.html || true
```

Expected: `<html lang="pt-BR">`, a stylesheet link is present, canonical and hreflang alternates present, og:\* present.

- [ ] **Step 12.6: Verify post renders with shiki colors**

```bash
curl -sL http://localhost:3000/pt-BR/posts/porque-typescript-importa > /tmp/post.html
grep -oE 'style="color:#[0-9a-fA-F]{6}' /tmp/post.html | head -5
# expected: several inline-style color spans (shiki output)
grep -c "hljs" /tmp/post.html
# expected: 0 (no highlight.js leftover classes)
```

- [ ] **Step 12.7: Verify sitemap and robots**

```bash
curl -sL http://localhost:3000/sitemap.xml | head -20
# expected: XML with <url> entries for both locales

curl -sL http://localhost:3000/robots.txt
# expected: User-agent: *, Allow: /, Sitemap: .../sitemap.xml
```

- [ ] **Step 12.8: Verify RSS feeds**

```bash
curl -sL http://localhost:3000/rss.xml | head -8
curl -sL http://localhost:3000/en/rss.xml | head -8
# expected: both valid RSS XML with language-matched title/desc
```

- [ ] **Step 12.9: Stop server**

```bash
kill $SERVER_PID 2>/dev/null || pkill -f "vinext start"
sleep 1
```

- [ ] **Step 12.10: Rewrite `CLAUDE.md`**

Replace the entire contents of `CLAUDE.md` with:

````markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal blog of Igor Hasse Santiago. Bilingual (pt-BR default, en alternate). Built with **vinext** (Vite + React SSR framework targeting Cloudflare Workers) using the **App Router** with a `[locale]` dynamic segment.

## Commands

```bash
npm run dev             # Start dev server
npm run build           # Production build
npm run start           # Start production server for local testing
npm run typecheck       # TypeScript type checking (tsc --noEmit)
npm run update:vinext   # Upgrade vinext to latest
npm run update:all      # Upgrade all top-level deps to latest
```
````

No linter or test runner configured.

## Tech Stack

- **vinext** `latest` (currently 0.0.43) — Vite 8 + React 19 SSR, Next.js-compatible API
- **App Router** (`app/` directory) — not Pages Router
- **TypeScript 6** strict mode
- **Tailwind CSS v4** via `@tailwindcss/vite` (tokens in `styles/tokens.css`)
- **marked** v18 + **shiki** — markdown rendering with server-side syntax highlighting
- **next/font/google** — Newsreader (serif), Geist (sans), JetBrains Mono (mono)
- **next/og** — dynamic OG image generation (prod-only, native modules break dev)
- Cloudflare Workers — deployment target (`vinext deploy`)

## Architecture

### Routing

- **App Router** with `[locale]` dynamic segment.
- `middleware.ts` redirects locale-less paths using: cookie `NEXT_LOCALE` > `Accept-Language` > fallback `pt-BR`.
- LocaleToggle sets the cookie on click, so manual preference persists.

### Content bundles

Each post lives in its own folder:

```
content/posts/<slug>/
  pt-BR.md       # Portuguese version
  en.md          # English version
  cover.jpg      # optional media (copied to public/posts/<slug>/ at build/dev time)
```

Slugs are Portuguese (audience is Brazilian). Markdown references assets with `./file.ext` — `lib/markdown.ts` rewrites to `/posts/<slug>/file.ext`, and `vite.config.ts`'s `assetsPlugin` copies them to `public/`.

### Server vs Client

- Default: Server Components.
- `'use client'` only where needed: toggles (Locale, Theme), forms (Newsletter), clipboard (CopyFeed), scroll (ProgressBar), DOM injection (PostEnhancements — only for anchor links; highlight is server-side shiki), active-state links (NavLink).

### i18n

- `i18n/strings.ts` — dictionary for pt-BR + en with TypeScript-enforced parity.
- `i18n/t.ts` — pure function `t(key, locale)` for Server Components.
- `i18n/useT.ts` — `'use client'` hook reading locale from `useParams()` (next/navigation).

### CSS

- `styles/tokens.css` — single source of truth for color/type tokens.
- `styles/globals.css` — layout + component styles, imports tokens.
- `app/[locale]/layout.tsx` does `import "../../styles/globals.css"` — App Router emits the stylesheet link in SSR natively.
- Critical inline CSS in the layout's head sets `color-scheme` per data-theme (minimal, no color duplication).
- Theme bootstrap inline script reads `localStorage["blog-theme"]` before first paint to avoid a dark→light flicker.

### SEO

- `app/[locale]/layout.tsx` and each page export `generateMetadata()` — canonical, hreflang, OpenGraph, Twitter.
- Post pages emit JSON-LD `BlogPosting`.
- `app/sitemap.ts` generates `/sitemap.xml` for all routes × locales with `hreflang` alternates.
- `app/robots.ts` generates `/robots.txt` pointing to the sitemap.
- `opengraph-image.tsx` files per route produce dynamic PNG OG images via `next/og`.

### Identity

All personal info (name, email, socials, URLs) lives in `lib/site-config.ts`. Everything else reads from there.

## Key vinext gotchas (still present in 0.0.43)

- **`next/font/google` = CDN runtime load.** No self-hosting or size-adjust fallbacks (per vinext README known limitations).
- **`next/og` only works in prod.** In `vinext dev`, Satori's native modules crash — OG image URLs return 404 locally. Deploy or `vinext build && vinext start` to test.
- **`require is not defined` in SSR for CJS-only deps.** Prefer ESM-native packages. `shiki` (ESM) instead of `highlight.js` (CJS).

## Philosophy: "The Digital Curator"

Editorial, minimalist, typography-driven. Zero border-radius. No visible borders — tonal surface shifts for separation. Dark-first; `#131313` charcoal, not pure black.

````

- [ ] **Step 12.11: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: rewrite CLAUDE.md for App Router reality

Reflects the migrated stack: App Router, shiki, next/font/google,
next/og, content bundles, lib/site-config, middleware-based i18n.
Documents remaining vinext gotchas for future agents."
````

- [ ] **Step 12.12: Final clean build + full verification pass**

```bash
rm -rf dist node_modules/.vite
npm run typecheck
npm run build
npm run start &
sleep 4
for locale in pt-BR en; do
  for path in "" /about /rss /posts/porque-typescript-importa; do
    url="http://localhost:3000/${locale}${path}"
    code=$(curl -sI -o /dev/null -w "%{http_code}" "$url")
    echo "$url → $code"
  done
done
pkill -f "vinext start"
```

Expected: all 8 URLs return `200`.

---

## Self-Review Checklist

Before handing off:

- [x] **Spec coverage**: every section of the spec has a corresponding task
  - Directory structure → Tasks 6, 8, 9, 10
  - i18n flow → Task 9 (middleware)
  - CSS pipeline → Task 6 (critical CSS + bootstrap in layout), Task 11 (drop hljs rules)
  - Server vs Client split → Task 7
  - SEO: Metadata → Tasks 6, 8; JSON-LD → Task 8; Sitemap/robots → Task 9; OG images → Task 10
  - Content bundles → Task 2 (rename) + Task 3 (posts.ts) + Task 4 (markdown.ts) + Task 11 (assetsPlugin)
  - Identity config → Task 1
  - Workarounds removed → Tasks 7, 8, 11 (all deletions)
  - Verification plan → Task 12

- [x] **No placeholders**: every step has actual code/command, no "implement later", no "similar to Task N".
- [x] **Type consistency**: `Locale` imported from `lib/site-config.ts` everywhere; `t(key, locale)` signature consistent across Server usage; `useT()` hook returns `(key) => string` consistently.
- [x] **Commit granularity**: each task ends with a commit. Some tasks commit intermediate WIP (Task 6) — flagged explicitly.

---

**Plan complete.**
