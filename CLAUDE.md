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
- **Ambient `next` types** — because vinext doesn't install `next` itself, some type imports from the `"next"` module root aren't automatically resolvable. See `next-env.d.ts` for the declarations we've needed (`Metadata`, `Viewport`, `MetadataRoute`, named font loaders, `ImageResponse`).
- **`openGraph.alternateLocale` is NOT typed** by vinext's Metadata shim, so we can't currently emit it via `generateMetadata()`. The equivalent SEO signal comes from our `<link rel="alternate" hreflang>` tags via `alternates.languages`, which Google treats as equivalent or stronger. Re-add `alternateLocale` if vinext's shim type ever includes it.

## Philosophy: "The Digital Curator"

Editorial, minimalist, typography-driven. Zero border-radius. No visible borders — tonal surface shifts for separation. Dark-first; `#131313` charcoal, not pure black.
