# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Blog pessoal (personal blog) built with **Vinext** — a Vite + React SSR framework targeting Cloudflare Workers. Language: Portuguese (pt-BR).

## Commands

```bash
npm run dev        # Start dev server
npm run build      # Production build (Cloudflare Workers)
npm run start      # Start production server
npm run typecheck  # TypeScript type checking (tsc --noEmit)
```

No linter or test runner configured.

## Tech Stack

- **Vinext** v0.0.7 (Vite 7 + React 19 SSR) — Pages Router, NOT App Router
- **TypeScript 6** — strict mode; `baseUrl` is deprecated, use tsconfig `paths` instead
- **Tailwind CSS v4** — configured via `@theme {}` blocks in `styles/globals.css` (no `tailwind.config.js`)
- **marked** + **highlight.js** — markdown rendering with syntax highlighting
- **Cloudflare Workers** — deployment target

## Architecture

**Routing:** File-based Pages Router under `pages/`. Dynamic routes use bracket syntax (`pages/posts/[slug].tsx`). Route params accessed via `useRouter().query` from the `next/router` vinext shim.

**App shell:** `_app.tsx` wraps all pages in `<Layout>` (which includes `<Header>`). `_document.tsx` handles HTML structure and loads Google Fonts.

**Content pipeline:**
1. Markdown files live in `content/posts/` with YAML frontmatter (`title`, `date`, `description`, `coverImage?`)
2. `lib/posts.ts` uses `import.meta.glob` to load all `.md` files as raw strings at build time
3. Frontmatter parser is regex-based — supports only simple `key: value` pairs (no nested YAML)
4. `lib/markdown.ts` renders markdown via `Marked` class (v15+ API — class instantiation, not default export) with custom renderer for syntax highlighting and lazy-loaded images
5. `getAllPosts()` returns `PostMeta[]` sorted by date descending; `getPostBySlug(slug)` returns full `Post` with raw markdown content

**Vinext shims:** Next.js-like imports (`next/router`, `next/link`, `next/head`) resolve to vinext shims via tsconfig `paths`. This means components use Next.js-style APIs but run on Vinext.

## Design System

Philosophy: "The Digital Curator" — editorial, minimalist, typography-driven.

- **Zero border-radius** everywhere (sharp 90° angles)
- **No visible borders** — use tonal surface shifts for separation (`surface`, `surface-container-low/high/highest`, `surface-bright`)
- **Fonts:** Newsreader (serif, display), Inter (sans, body), Space Grotesk (mono/UI labels) — loaded via Google Fonts CDN in `_document.tsx`
- **Dark mode only** — base surface is `#131313` (deep charcoal, not pure black)
- All design tokens defined as CSS custom properties inside `@theme {}` in `styles/globals.css`

## Key Vinext/Vite Gotchas

- `import.meta.glob` requires `/// <reference types="vite/client" />` in `env.d.ts`
- `marked` v15+ uses `new Marked()` class instantiation, not a default export function
- highlight.js: check language availability with `hljs.getLanguage(lang)` before calling `highlight()`
- Cover images reference external URLs (Unsplash) — no local image pipeline

## Integrations

- **Newsletter:** Mailchimp client-side form (no API key needed). Component at `components/Newsletter.tsx` — URL placeholder needs real Mailchimp list values for production.
