# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal blog of Igor Hasse Santiago. Bilingual (pt-BR default, en alternate). Built with **vinext** (Vite + React SSR framework targeting Cloudflare Workers) using the **App Router** with a `[locale]` dynamic segment.

## Package manager

This project uses **Yarn 4 (Berry)**, not npm. The version is pinned via the `packageManager` field in `package.json` and resolved by Corepack — running `yarn` inside this directory will automatically use the pinned version. **Never use `npm` here**: there is no `package-lock.json`, only `yarn.lock`. To bump yarn itself: `corepack use yarn@stable`.

## Commands

```bash
yarn dev                # Start dev server
yarn build              # Production build
yarn start              # Start production server for local testing
yarn typecheck          # TypeScript type checking (tsc --noEmit)
yarn lint               # oxlint .
yarn lint:fix           # oxlint . --fix
yarn format             # oxfmt --check .
yarn format:fix         # oxfmt .
yarn test               # vitest run (unit)
yarn test:watch         # vitest (watch mode)
yarn test:coverage      # vitest run --coverage
yarn test:smoke         # vitest run --config vitest.smoke.config.ts (needs local server)
yarn check              # lint + format + typecheck + test (what pre-push + CI runs)
yarn update:vinext      # Upgrade vinext to latest
yarn update:all         # Upgrade all top-level deps to latest
```

## Tech Stack

- **vinext** `latest` (currently 0.0.43) — Vite 8 + React 19 SSR, Next.js-compatible API
- **App Router** (`app/` directory) — not Pages Router
- **TypeScript 6** strict mode
- **Tailwind CSS v4** via `@tailwindcss/vite` (tokens in `styles/tokens.css`)
- **marked** v18 + **shiki** v4 — markdown rendering with server-side syntax highlighting (JavaScript regex engine, not oniguruma WASM — see vinext gotchas)
- **next/font/google** — Newsreader (serif), Geist (sans), JetBrains Mono (mono)
- **next/og** — dynamic OG image generation (prod-only, native modules break dev)
- **Cloudflare Workers** — deployment target (`vinext deploy` invoked via CI)
- **oxlint + oxfmt** — linter and formatter (Rust-based, ~50× faster than ESLint/Prettier)
- **vitest** v4 — unit + smoke test runner
- **husky + lint-staged** — pre-commit (lint-staged) and pre-push (`yarn run check`) hooks

## Architecture

### Routing

- **App Router** with `[locale]` dynamic segment.
- `proxy.ts` redirects locale-less paths using: cookie `NEXT_LOCALE` > `Accept-Language` > fallback `pt-BR`. Helpers `hasLocalePrefix` and `detectLocale` are exported for unit tests. (Renamed from `middleware.ts` per the Next.js 16 / vinext rename — function is now exported as `proxy`.)
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

### Deployment

- `wrangler.jsonc` declares `main: "./worker/index.ts"`, `assets.binding: "ASSETS"`, `images.binding: "IMAGES"`, and Custom Domains for `igorhasse.com` + `www.igorhasse.com`.
- `worker/index.ts` (generated by `vinext deploy --dry-run`) is the Cloudflare Worker entry: combines `vinext/server/app-router-entry` + image optimization + ASSETS fallback.
- `.github/workflows/deploy.yml` runs `npx vinext deploy` on push to `main` with `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` secrets.

## Key vinext / Cloudflare Workers gotchas

- **`next/font/google` = CDN runtime load.** No self-hosting or size-adjust fallbacks (per vinext README known limitations).
- **`next/og` only works in prod.** In `vinext dev`, Satori's native modules crash — OG image URLs return 404 locally. Deploy or `vinext build && vinext start` to test.
- **`require is not defined` in SSR for CJS-only deps.** Prefer ESM-native packages. `shiki` (ESM) instead of `highlight.js` (CJS).
- **Ambient `next` types** — because vinext doesn't install `next` itself, some type imports from the `"next"` module root aren't automatically resolvable. See `next-env.d.ts` for the declarations we've needed (`Metadata`, `Viewport`, `MetadataRoute`, named font loaders, `ImageResponse`).
- **`openGraph.alternateLocale` is NOT typed** by vinext's Metadata shim, so we can't currently emit it via `generateMetadata()`. The equivalent SEO signal comes from our `<link rel="alternate" hreflang>` tags via `alternates.languages`, which Google treats as equivalent or stronger. Re-add `alternateLocale` if vinext's shim type ever includes it.
- **Workers runtime forbids `WebAssembly.instantiate()` from bytes.** Shiki's default oniguruma regex engine loads a WASM blob at runtime → crashes the Worker with error 1101. Fix: use `createHighlighterCore` + `createJavaScriptRegexEngine` (pure JS) as in `lib/markdown.ts`. WASM is only allowed when declared as a binding in `wrangler.jsonc`.
- **Vite does NOT minify SSR/Worker bundles by default.** Our `vite.config.ts` explicitly sets `build.minify: "esbuild"` on each environment (`client`, `rsc`, `ssr`). Without this, Cloudflare Workers gets ~40% more JS than necessary.
- **Use `vinext deploy`, not `wrangler deploy` directly.** `vinext deploy` handles worker/index.ts generation, build wiring, and wrangler invocation. Raw `wrangler deploy` via `@cloudflare/vite-plugin` alone produces an assets-only deploy (no Worker main wired up).
- **Shiki language imports are explicit and scoped.** `lib/markdown.ts` imports only the languages our posts use (`css`, `tsx`, `typescript`, `yaml`) from `shiki/langs/*.mjs`. When adding a post that uses a new language: add the import + `LANGS` entry + `SUPPORTED_LANGS` entry in `lib/markdown.ts` (aliases go in `normalizeLang`).

## CI / CD workflow

**Every commit and push is gated locally by husky:**

- `pre-commit` → `lint-staged` (oxlint + oxfmt) on staged files only
- `pre-push` → `yarn run check` (lint + format + typecheck + test) on the whole tree

**CI** (`.github/workflows/ci.yml`) runs three jobs on every PR + push to `main`:

- `check` — `lint`, `format`, `typecheck`, `test -- --coverage`, `build`
- `smoke` — builds, starts `vinext start` in background, runs `test:smoke` against HTTP
- `vuln` — `yarn npm audit --severity high --recursive`

**Deploy** (`.github/workflows/deploy.yml`) runs on push to `main` only: `npx vinext deploy` publishes the Worker to Cloudflare.

**Dependabot** (`.github/dependabot.yml`): weekly grouped npm-ecosystem PR (also covers yarn-managed deps via `package.json`), monthly GitHub Actions updates.

**Day-to-day workflow is commands-free**: edit, `git commit` (hooks run), `git push` (hooks run), CI confirms, merge after green. Deploy is automatic.

## Testing guidelines

Use this heuristic when adding features:

- **Always write a unit test for**: pure functions in `lib/`, `i18n/` logic, middleware helpers, SEO generators (sitemap, canonical, hreflang), parsers of external data.
- **Always add a smoke test** (in `tests/smoke.test.ts`) for: a new route in `app/`, a new XML output, a new middleware handler.
- **Skip tests for**: pure visual components, CSS tokens, thin hook wrappers, markdown content.

**Decision heuristic**: _"If I silently break this logic, will a higher layer catch it?"_ Yes → skip. No → write the test.

**File locations**: unit tests co-located with source (`lib/posts.ts` → `lib/posts.test.ts`); smoke tests in `tests/smoke.test.ts`.

The `.github/PULL_REQUEST_TEMPLATE.md` has this as a checklist.

## Philosophy: "The Digital Curator"

Editorial, minimalist, typography-driven. Zero border-radius. No visible borders — tonal surface shifts for separation. Dark-first; `#131313` charcoal, not pure black.
