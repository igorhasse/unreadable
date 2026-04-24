# App Router Migration — Design

**Date:** 2026-04-24
**Status:** Approved by user, pending implementation plan
**Scope:** Migrate blog from vinext Pages Router to App Router; swap highlight.js → shiki; restructure content into per-post bundles; add SEO foundations.

---

## Context

The blog currently runs on **vinext 0.0.43 Pages Router**. Through this session we hit several architectural limitations in vinext's Pages Router SSR pipeline that required workarounds:

1. `next/head` content from `_app.tsx` is collected before the body stream renders → tags don't reach the SSR shell.
2. `collectAssetTags` doesn't recursively walk chunk imports → `_app.tsx`'s CSS chunk isn't emitted in SSR.
3. SSR router context is cleared before body render → `useRouter().query.slug` and `.locale` are undefined in components.

These forced us to accumulate patches: hardcoded `<link>` tags, `assetFileNames` override, `next/compat/router`, `getServerSideProps` for slug access, `globalThis.__VINEXT_LOCALE__` fallback, client-side-only syntax highlighting.

The vinext test fixtures confirm the gap: only App Router fixtures exercise CSS imports. Pages Router fixtures test routing and hydration but never import a stylesheet. App Router is the tested, supported, batteries-included path on vinext.

**This migration removes every workaround by adopting the canonical App Router pattern.** Every piece of the tech-stack that didn't integrate cleanly is replaced with something that does: `highlight.js` (CJS-first, breaks in Vite 8 SSR) → `shiki` (ESM-native, designed for RSC).

## Goals

- **Zero framework workarounds**: every file should be written as if we're reading the Next.js 16 docs — nothing bespoke.
- **SEO reference-quality**: metadata per page, structured data (JSON-LD), sitemap, robots, OG images, hreflang, canonical URLs.
- **Content organization that scales**: per-post folder (content bundle) with PT + EN markdown + media assets colocated.
- **Clean i18n**: URLs always without locale prefix when shared (`igorhasse.com/posts/foo`); middleware redirects based on cookie > Accept-Language > pt-BR fallback.
- **Fast, accessible, minimal JS**: Server Components by default; Client islands for genuinely interactive parts only.

## Non-goals

- Support for App Router features we don't need (parallel routes, intercepting routes, RSC suspense boundaries).
- Custom OG image per post — dynamic `next/og` generates from metadata, no manual work.
- Migrating `marked` → `remark/rehype`. `marked` v18 is ESM-native and works cleanly. Future concern if we need GFM/footnotes/auto-anchors at build time.

## Architecture

### Directory structure

```
app/
  not-found.tsx                      # global 404 (for paths that don't match locale)
  sitemap.ts                         # generates /sitemap.xml
  robots.ts                          # generates /robots.txt
  [locale]/
    layout.tsx                       # root layout: <html>, <body>, fonts, global CSS import
    page.tsx                         # home — posts list
    opengraph-image.tsx              # dynamic OG for home
    about/
      page.tsx
      opengraph-image.tsx
    rss/
      page.tsx
      opengraph-image.tsx
    posts/[slug]/
      page.tsx
      opengraph-image.tsx            # dynamic OG per post
      not-found.tsx                  # 404 when post doesn't exist
middleware.ts                        # locale detection + redirect
components/
  SiteHeader.tsx                     # Server; contains Client islands
  SiteFooter.tsx                     # Server
  PostRow.tsx                        # Server
  Newsletter.tsx                     # 'use client' (form state)
  LocaleToggle.tsx                   # 'use client' (router navigation + cookie)
  ThemeToggle.tsx                    # 'use client' (localStorage + DOM)
  CopyFeed.tsx                       # 'use client' (clipboard)
  ProgressBar.tsx                    # 'use client' (scroll listener)
  NavLink.tsx                        # 'use client' — new; active-state via usePathname()
  PostEnhancements.tsx               # 'use client' — new; anchor-link injection only
i18n/
  strings.ts                         # unchanged
  t.ts                               # NEW — server-side translator
  useT.ts                            # rewritten — uses useParams() from next/navigation
lib/
  site-config.ts                     # NEW — centralized identity (name, email, socials, URLs)
  posts.ts                           # slug-based content bundle structure
  markdown.ts                        # async; shiki for highlight; rewrites ./asset paths
content/posts/
  <slug>/
    pt-BR.md                         # Portuguese version
    en.md                            # English version
    cover.jpg                        # optional media assets (colocated)
    diagram.png
public/
  favicon.svg
  apple-touch-icon.png
  posts/<slug>/*                     # copied from content/posts/<slug>/ at build time
  rss.xml                            # generated by rssPlugin
  en/rss.xml
styles/
  globals.css                        # removes .hljs-* rules (shiki inlines colors)
  tokens.css                         # unchanged
vite.config.ts                       # adds assetsPlugin for content bundles; removes Pages Router hacks
tsconfig.json                        # adjusted paths for next/navigation
package.json                         # swaps highlight.js → shiki
CLAUDE.md                            # rewritten for App Router reality
```

### i18n flow (middleware)

Public URLs carry no locale prefix when possible. Middleware inspects requests and redirects to the correct locale path.

**Decision order** (highest priority first):

1. Pathname already has `/pt-BR` or `/en` prefix → pass through.
2. Cookie `NEXT_LOCALE` is set (user manually chose via LocaleToggle) → redirect to `/<cookie-locale><path>`.
3. `Accept-Language` header indicates preference → redirect accordingly.
4. Fallback → `pt-BR` (primary audience is Brazilian).

**LocaleToggle** sets `NEXT_LOCALE=<new-locale>` cookie with `Path=/; Max-Age=31536000; SameSite=Lax` when user clicks, so the choice persists across sessions.

**Slug strategy**: slugs are in Portuguese in both locales. `content/posts/porque-typescript-importa/pt-BR.md` and `.../en.md` share the same folder name. URL pattern:
- `igorhasse.com/pt-BR/posts/porque-typescript-importa`
- `igorhasse.com/en/posts/porque-typescript-importa` (English content, Portuguese URL slug)

This means shared URLs like `igorhasse.com/posts/porque-typescript-importa` redirect cleanly to either locale depending on reader's browser preference.

**Middleware matcher** excludes static assets, rss.xml, _next internals:
```
matcher: ['/((?!_next|assets|posts/.+\\.[a-z0-9]+|favicon|apple-touch-icon|sitemap|robots|rss\\.xml).*)'],
```

### CSS pipeline

Canonical Next.js pattern. Zero workaround.

```tsx
// app/[locale]/layout.tsx
import "../../styles/globals.css";  // App Router emits <link rel="stylesheet"> in SSR natively
```

**Head additions** (in root layout, render as children of `<head>`):

- `<meta name="theme-color">` for mobile browser chrome (dark + light media queries).
- **Minimal critical inline CSS** — only `color-scheme` per theme, 4 lines, no color duplication:
  ```css
  html { color-scheme: dark; }
  html[data-theme="light"] { color-scheme: light; }
  ```
  Ensures native scrollbars/form controls render in the right tone before the external CSS loads.
- **Theme bootstrap inline script** — reads `localStorage['blog-theme']` and sets `data-theme` on `<html>` before body paint. Prevents dark→light flicker for users who picked light mode. Industry-standard pattern.

**Fonts** — `next/font/google` (vinext supports 🟡: CDN runtime load):
```tsx
import { Newsreader, Geist, JetBrains_Mono } from "next/font/google";
```
Imports become font CSS variables applied to `<body className={...}>`.

### Server vs Client components

Server by default (zero JS shipped for that component). `'use client'` only where genuinely needed.

| File | Type | Reason |
|---|---|---|
| `app/[locale]/layout.tsx` | Server | Static shell |
| `app/[locale]/page.tsx` (home) | Server | Calls `getAllPosts(locale)` |
| `app/[locale]/about/page.tsx` | Server | Static content |
| `app/[locale]/rss/page.tsx` | Server | Static list; `<CopyFeed>` inside is Client |
| `app/[locale]/posts/[slug]/page.tsx` | Server | async — calls shiki at render time |
| `components/SiteHeader.tsx` | Server | Markup; Client islands inside |
| `components/SiteFooter.tsx` | Server | — |
| `components/PostRow.tsx` | Server | — |
| `components/NavLink.tsx` | `'use client'` | `usePathname()` for active state |
| `components/LocaleToggle.tsx` | `'use client'` | Cookie + navigation |
| `components/ThemeToggle.tsx` | `'use client'` | localStorage + DOM |
| `components/Newsletter.tsx` | `'use client'` | Form state |
| `components/CopyFeed.tsx` | `'use client'` | Clipboard API |
| `components/ProgressBar.tsx` | `'use client'` | Scroll event listener |
| `components/PostEnhancements.tsx` | `'use client'` | Injects `<a class="anchor">#</a>` into headings |

**i18n for Server vs Client**:

```ts
// i18n/t.ts — Server
export function t(key: StringKey, locale: Locale): string {
  return STRINGS[locale][key];
}

// i18n/useT.ts — Client
import { useParams } from "next/navigation";
export function useT() {
  const { locale } = useParams<{ locale: Locale }>();
  return (key: StringKey) => STRINGS[locale ?? "pt-BR"][key];
}
```

Both read from the same `i18n/strings.ts`.

### SEO

**Metadata** via Next 16 Metadata API (vinext ✅):

- **Root layout** (`app/[locale]/layout.tsx` → `generateMetadata`):
  - `metadataBase`, `applicationName`, `authors`, `creator`, `publisher`
  - `alternates.canonical: /${locale}`, `alternates.languages: { pt-BR, en, x-default }`
  - `openGraph.siteName`, `openGraph.locale`, `openGraph.alternateLocale`
  - `twitter.creator`, `twitter.site`, `twitter.card: summary_large_image`
  - `icons` (favicon.svg, apple-touch-icon.png)
  - `robots: { index, follow }`

- **Post page** (`app/[locale]/posts/[slug]/page.tsx` → `generateMetadata`):
  - `title`, `description` from frontmatter
  - `alternates.canonical: /${locale}/posts/${slug}`
  - `alternates.languages` with each locale mapping
  - `openGraph.type: article`, `publishedTime`, `authors`, `tags`
  - `twitter.card: summary_large_image`
  - OG image referenced from dynamic `opengraph-image.tsx` sibling (auto-detected by Next)

**Structured data (JSON-LD)** as `<script type="application/ld+json">`:

- Home: `Blog` + `Person` (author)
- About: `Person` with `sameAs: [linkedin, github, twitter]`
- Post: `BlogPosting` + `BreadcrumbList`

**Sitemap** (`app/sitemap.ts`) generates `/sitemap.xml` from `getAllPosts()` for both locales. Each post entry lists `alternates.languages`.

**Robots** (`app/robots.ts`) allows all crawlers, references sitemap URL.

**OG images** — dynamic via `next/og`. Template renders JSX → Satori → PNG at runtime. Visual direction:

- 1200×630, background `#131313`
- `IGOR HASSE · <LOCALE>` in mono amber (eyebrow)
- Post title in Newsreader serif, 68px, weight 500, balanced wrap
- Description in Geist sans, 28px, `--fg-2` color
- Footer: `igorhasse.com · <date>` in mono, `--fg-3` color

Caveat per vinext README (line 563): `next/og` crashes in `vinext dev` (Satori uses native node modules). Works in prod builds. Locally we'll see 404 for OG image URLs — acceptable (localhost shares aren't scraped).

### Content bundle structure

**Rationale**: each post is a self-contained folder with translations + media. Easier to manage, matches Astro/Hugo conventions, scales naturally.

```
content/posts/
  porque-typescript-importa/
    pt-BR.md              # Portuguese content
    en.md                 # English content
    cover.jpg             # optional — hero image
    diagram.png           # inline media
```

**Markdown references assets with relative paths**:
```markdown
![diagrama](./diagram.png)
<video src="./demo.mp4" controls></video>
```

**Build-time asset copy** — `vite.config.ts` gains an `assetsPlugin` (~25 lines) that:
- On `buildStart` + dev server file watcher: walks `content/posts/**`, copies non-`.md` files to `public/posts/<slug>/`.
- Result: markdown can use `./diagram.png`, browser receives `/posts/porque-typescript-importa/diagram.png`.

**Runtime path rewrite** in `lib/markdown.ts`:
- `renderMarkdown(content, slug)` — slug threaded through, custom marked renderer rewrites `./foo.png` → `/posts/<slug>/foo.png`.

**lib/posts.ts updates**:
- `import.meta.glob("/content/posts/*/*.md", { query: "?raw", eager: true, import: "default" })`
- Parse keys as `/content/posts/<slug>/<locale>.md`
- `getPostBySlug(slug, locale)` reads the matching map entry
- `getAllPosts(locale)` filters to entries where locale matches, sorts by date
- `getTranslatedSlug(slug, from, to)` trivially returns same slug (both folders always have it per user's paridade total rule)

**Migration of existing placeholder content**:

The 3 existing placeholder posts get renamed to Portuguese slugs as part of this migration:

| Current (Pages Router layout) | After migration (content bundle) |
|---|---|
| `content/posts/pt-BR/building-a-modern-web-stack.md`<br>`content/posts/en/building-a-modern-web-stack.md` | `content/posts/construindo-stack-web-moderna/pt-BR.md`<br>`content/posts/construindo-stack-web-moderna/en.md` |
| `content/posts/pt-BR/why-typescript-matters.md`<br>`content/posts/en/why-typescript-matters.md` | `content/posts/porque-typescript-importa/pt-BR.md`<br>`content/posts/porque-typescript-importa/en.md` |
| `content/posts/pt-BR/getting-started-with-react.md`<br>`content/posts/en/getting-started-with-react.md` | `content/posts/comecando-com-react/pt-BR.md`<br>`content/posts/comecando-com-react/en.md` |

Content bodies don't change (they're placeholders anyway). `canonical` frontmatter field is no longer needed since slugs match across locales — safely removed.

### Identity config (`lib/site-config.ts`)

Single source of truth for personal identity. Referenced everywhere (metadata, footer, JSON-LD, about page, RSS plugin):

```ts
export const SITE = {
  url: "https://igorhasse.com",
  name: "igor hasse",
  description: {
    "pt-BR": "Notas públicas de Igor Hasse sobre editores, tipos e sistemas.",
    "en": "Public notes by Igor Hasse on editors, type systems, and software.",
  },
  author: {
    name: "Igor Hasse Santiago",
    email: "igor.hasse@gmail.com",
    twitter: "@deserverd",    // temporary, will change when professional handle is created
    github: "igorhasse",
    linkedin: "https://www.linkedin.com/in/igor-santiago/",
  },
} as const;
```

## Dependencies

**Removed**:
- `highlight.js` (CJS-first, breaks in Vite 8 SSR)

**Added**:
- `shiki` (ESM-native, designed for RSC, VS Code-quality highlighting via TextMate grammars)

**Kept**:
- `vinext`, `vite`, `@vitejs/plugin-react`, `react`, `react-dom`
- `tailwindcss`, `@tailwindcss/vite`, `@tailwindcss/postcss`
- `marked` v18 (ESM-native, no workaround needed for our usage)

## What gets deleted

```
pages/                        # entire directory
pages/_app.tsx
pages/_document.tsx
pages/index.tsx
pages/about.tsx
pages/rss.tsx
pages/posts/[slug].tsx
next.config.mjs               # App Router doesn't use Pages Router-style i18n config
```

## Workarounds that die with this migration

- `globalThis.__VINEXT_LOCALE__` fallback in `useT`
- `getServerSideProps` in `posts/[slug].tsx`
- `next/compat/router` imports in components
- Conditional dev/prod CSS `<link>` in `_document`
- `assetFileNames: "app.css"` hack in `vite.config.ts`
- Hardcoded `<link rel="stylesheet" href="/assets/app.css">` in `_document`
- Hardcoded Google Fonts `<link>` tags in `_document`
- Client-side `useEffect` for highlight.js dynamic import

## Verification plan

Manual verification after implementation (detailed test steps in the writing-plans output):

1. **Typecheck** — `npm run typecheck` clean.
2. **Build** — `npm run build` succeeds; output includes sitemap.xml, robots.txt, rss.xml, en/rss.xml, static HTML for all locale/page combinations.
3. **Prod server** — `npm run start`, curl each page in both locales, inspect `<head>`:
   - `<link rel="stylesheet">` for main CSS is present (native emission, no workaround).
   - Google Fonts `<link>` from `next/font/google` present.
   - `<link rel="canonical">` and `<link rel="alternate" hreflang="...">` correct per page.
   - `<script type="application/ld+json">` present with valid schema.
   - `<html lang>` matches locale.
4. **Middleware redirect** — `curl -I http://localhost:3000/` with different `Accept-Language` headers → 307 to correct `/pt-BR` or `/en`.
5. **Cookie precedence** — set `NEXT_LOCALE=en` cookie, then `curl` with `Accept-Language: pt-BR` → should redirect to `/en/...` (cookie wins over browser language, per decision order).
6. **LocaleToggle click** — switches URL, sets NEXT_LOCALE cookie, persists on reload.
7. **Post render** — code blocks have shiki-inlined colors in the HTML (not client-injected).
8. **Asset bundle** — put `test.png` in a post folder, reference as `./test.png` in markdown, verify image loads from `/posts/<slug>/test.png`.
9. **Sitemap** — `GET /sitemap.xml` lists all URLs in both locales with `xhtml:link` alternates.
10. **Robots** — `GET /robots.txt` allows all, points to sitemap.
11. **OG image** — `GET /pt-BR/posts/<slug>/opengraph-image.png` in prod returns PNG with correct styling.
12. **Dark/light theme** — toggle works; no flicker on reload for stored preference; scrollbar follows theme.
13. **Dev** — `npm run dev` starts clean; hot reload works; CSS updates reflect without full reload.

---

**Next step after user approval:** invoke writing-plans skill to produce step-by-step implementation plan with dependency order, commit checkpoints, and test gates.
