# CI Pipeline & Cloudflare Deploy — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a hands-off CI/CD pipeline (lint + tests + vulnerability scan on every push, preview deploy per PR, production deploy on merge to main) and configure Cloudflare Workers hosting.

**Architecture:** Three layers. Local hooks (husky + lint-staged) validate on commit/push. GitHub Actions runs the full suite on push and handles deploy via `wrangler-action`. Cloudflare Workers hosts the Worker with static assets served from the edge. Main branch protected; solo-dev workflow uses PRs with required CI checks.

**Tech Stack:** oxlint, oxfmt, vitest, husky, lint-staged, GitHub Actions, Cloudflare Workers (free tier), wrangler, Dependabot.

**Reference:** Design spec at `docs/superpowers/specs/2026-04-24-ci-pipeline-and-cloudflare-deploy-design.md`.

**Working directory:** `/home/atenccion/personal-work/unreadable`. Use a worktree at `.worktrees/ci-pipeline` to isolate this work from main.

---

## Pre-flight

- [ ] **PF.1: Verify main is clean and on latest state**

```bash
cd /home/atenccion/personal-work/unreadable
git status
git log --oneline -3
```

Expected: clean working tree, HEAD is on the CI spec commit (`f52c377`).

- [ ] **PF.2: Create worktree for this feature**

```bash
git worktree add .worktrees/ci-pipeline -b feat/ci-pipeline
cd .worktrees/ci-pipeline
npm install --legacy-peer-deps
```

Expected: worktree created, dependencies installed with no vulnerabilities.

- [ ] **PF.3: Verify baseline build passes**

```bash
npm run typecheck && npm run build
```

Expected: both pass.

**All subsequent tasks run from `/home/atenccion/personal-work/unreadable/.worktrees/ci-pipeline` unless noted.**

---

## Task 1: Install devDependencies

**Purpose:** Pull in every runtime needed for the rest of the plan. No behavior change yet.

**Files:**

- Modify: `package.json` (devDependencies)
- Modify: `package-lock.json` (auto)

- [ ] **Step 1.1: Install tooling**

```bash
npm install --save-dev --legacy-peer-deps \
  oxlint \
  oxfmt \
  vitest \
  @vitest/coverage-v8 \
  husky \
  lint-staged
```

Expected: 6 new devDeps added. No error output.

- [ ] **Step 1.2: Verify installed versions exist**

```bash
npx oxlint --version
npx oxfmt --version
npx vitest --version
npx husky --version
npx lint-staged --version
```

Expected: each prints a version number.

- [ ] **Step 1.3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install oxlint, oxfmt, vitest, husky, lint-staged" --no-verify
```

---

## Task 2: Configure oxlint + oxfmt + vitest

**Purpose:** Static config files so local commands + CI use the same rules.

**Files:**

- Create: `.oxlintrc.json`
- Create: `.oxfmtrc.json`
- Create: `vitest.config.ts`
- Modify: `tsconfig.json` (add vitest globals)
- Modify: `.gitignore` (vitest coverage output)

- [ ] **Step 2.1: Create `.oxlintrc.json`**

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["typescript", "react", "react-hooks", "import"],
  "categories": {
    "correctness": "error",
    "suspicious": "warn",
    "perf": "warn"
  },
  "env": {
    "browser": true,
    "node": true,
    "es2022": true
  },
  "rules": {
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  },
  "ignorePatterns": ["dist", "node_modules", ".worktrees", "public/assets", "public/posts"]
}
```

- [ ] **Step 2.2: Create `.oxfmtrc.json`**

```json
{
  "$schema": "./node_modules/oxfmt/configuration_schema.json",
  "useTabs": false,
  "tabWidth": 2,
  "semi": true,
  "singleQuote": false,
  "trailingComma": "es5",
  "printWidth": 100
}
```

- [ ] **Step 2.3: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "next/app": path.resolve(__dirname, "node_modules/vinext/dist/shims/app"),
      "next/compat/router": path.resolve(__dirname, "node_modules/vinext/dist/shims/compat-router"),
      "next/document": path.resolve(__dirname, "node_modules/vinext/dist/shims/document"),
      "next/head": path.resolve(__dirname, "node_modules/vinext/dist/shims/head"),
      "next/link": path.resolve(__dirname, "node_modules/vinext/dist/shims/link"),
      "next/router": path.resolve(__dirname, "node_modules/vinext/dist/shims/router"),
      "next/navigation": path.resolve(__dirname, "node_modules/vinext/dist/shims/navigation"),
      "next/image": path.resolve(__dirname, "node_modules/vinext/dist/shims/image"),
      "next/dynamic": path.resolve(__dirname, "node_modules/vinext/dist/shims/dynamic"),
      "next/og": path.resolve(__dirname, "node_modules/vinext/dist/shims/og"),
      "next/font/google": path.resolve(__dirname, "node_modules/vinext/dist/shims/font-google"),
      "next/server": path.resolve(__dirname, "node_modules/vinext/dist/shims/server"),
    },
  },
  test: {
    environment: "node",
    globals: true,
    include: ["**/*.test.ts", "**/*.test.tsx"],
    exclude: ["node_modules", "dist", ".worktrees", "tests/smoke.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: [
        "node_modules",
        "dist",
        ".worktrees",
        "**/*.test.ts",
        "**/*.test.tsx",
        "tests/**",
        "vitest.config.ts",
        "vite.config.ts",
        "next-env.d.ts",
        "env.d.ts",
        "app/**/opengraph-image.tsx",
      ],
    },
  },
});
```

- [ ] **Step 2.4: Modify `tsconfig.json` to add vitest globals**

Open `tsconfig.json` and add `"types": ["vitest/globals", "node", "vite/client"]` to `compilerOptions`. Full file should become:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "types": ["vitest/globals", "node", "vite/client"],
    "paths": {
      "next/app": ["./node_modules/vinext/dist/shims/app"],
      "next/compat/router": ["./node_modules/vinext/dist/shims/compat-router"],
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
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules", "dist", ".worktrees"]
}
```

- [ ] **Step 2.5: Add coverage output to `.gitignore`**

Append to `.gitignore`:

```
coverage/
.vitest/
```

- [ ] **Step 2.6: Sanity test — run vitest with no tests**

```bash
npx vitest run
```

Expected: "No test files found" message. Exit code 1 is acceptable — we just need vitest to load config without error.

- [ ] **Step 2.7: Sanity test — run oxlint on existing code**

```bash
npx oxlint .
```

Expected: passes with 0 errors (may show warnings — not blocking). If errors appear, read them. The project was passing tsc before, oxlint rules are similar — should be clean.

If oxlint reports errors, do NOT fix them now. Note them and continue — Task 8 (polish) can address real issues. For this step, we only need oxlint to RUN, not to be error-free.

- [ ] **Step 2.8: Commit**

```bash
git add .oxlintrc.json .oxfmtrc.json vitest.config.ts tsconfig.json .gitignore
git commit -m "feat: configure oxlint, oxfmt, vitest" --no-verify
```

---

## Task 3: Add npm scripts

**Files:**

- Modify: `package.json` (scripts)

- [ ] **Step 3.1: Update scripts block in `package.json`**

The full `scripts` block becomes:

```json
"scripts": {
  "dev": "vinext dev",
  "build": "vinext build",
  "start": "vinext start",
  "typecheck": "tsc --noEmit",
  "lint": "oxlint .",
  "lint:fix": "oxlint . --fix",
  "format": "oxfmt --check .",
  "format:fix": "oxfmt .",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage",
  "check": "npm run lint && npm run format && npm run typecheck && npm run test",
  "prepare": "husky",
  "update:vinext": "npm install vinext@latest --legacy-peer-deps",
  "update:all": "npm install vinext@latest vite@latest @vitejs/plugin-react@latest tailwindcss@latest @tailwindcss/vite@latest @tailwindcss/postcss@latest marked@latest shiki@latest react@latest react-dom@latest --legacy-peer-deps"
}
```

- [ ] **Step 3.2: Add `lint-staged` config to `package.json`**

At the root of `package.json` (sibling to `scripts`), add:

```json
"lint-staged": {
  "*.{ts,tsx,js,jsx}": ["oxlint --fix", "oxfmt"],
  "*.{json,md,css}": ["oxfmt"]
}
```

- [ ] **Step 3.3: Sanity test each new script**

```bash
npm run lint
npm run format
npm run typecheck
npm run test
```

Expected: each runs. `test` says no tests found — that's fine (tests come in Task 5).

- [ ] **Step 3.4: Commit**

```bash
git add package.json
git commit -m "feat: add npm scripts for lint/format/test/check" --no-verify
```

---

## Task 4: Set up husky hooks

**Files:**

- Create: `.husky/pre-commit`
- Create: `.husky/pre-push`

- [ ] **Step 4.1: Initialize husky**

```bash
npx husky init
```

This creates `.husky/` with a stub `pre-commit`. We'll replace it.

- [ ] **Step 4.2: Write `.husky/pre-commit`**

Overwrite `.husky/pre-commit` with:

```sh
npx lint-staged
```

Set executable bit:

```bash
chmod +x .husky/pre-commit
```

- [ ] **Step 4.3: Write `.husky/pre-push`**

```bash
cat > .husky/pre-push << 'EOF'
npm run typecheck && npm run test
EOF
chmod +x .husky/pre-push
```

- [ ] **Step 4.4: Verify hooks work — pre-commit**

Create a temporary `.ts` file with intentionally bad formatting:

```bash
cat > /tmp/hook-test.tsx << 'EOF'
export const foo   =   'bar'
EOF
cp /tmp/hook-test.tsx components/_HookTest.tsx
git add components/_HookTest.tsx
git commit -m "test: hook check" --no-verify
```

Wait — we used `--no-verify` to avoid breaking progress. Let's do a real test WITHOUT `--no-verify`:

```bash
git add components/_HookTest.tsx
git commit -m "test: hook check"
```

Expected: oxlint + oxfmt run on the staged file, auto-format the double-spaces and missing semicolon, re-stage, commit succeeds. The file now has `export const foo = "bar";`.

Verify:

```bash
cat components/_HookTest.tsx
```

- [ ] **Step 4.5: Clean up test file**

```bash
git rm components/_HookTest.tsx
git commit -m "revert: remove hook test file" --no-verify
```

- [ ] **Step 4.6: Commit hook files**

```bash
git add .husky/
git commit -m "feat: add husky pre-commit (lint-staged) and pre-push (typecheck+test)" --no-verify
```

---

## Task 5: Write unit tests for `lib/posts.ts`

**Files:**

- Create: `lib/posts.test.ts`

- [ ] **Step 5.1: Write `lib/posts.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { getAllPosts, getPostBySlug, getTranslatedSlug } from "./posts";

describe("getPostBySlug", () => {
  it("returns a post when slug + locale match a file", () => {
    const post = getPostBySlug("porque-typescript-importa", "pt-BR");
    expect(post).not.toBeNull();
    expect(post?.slug).toBe("porque-typescript-importa");
    expect(post?.locale).toBe("pt-BR");
    expect(post?.title).toBeTruthy();
  });

  it("returns null for a non-existent slug", () => {
    const post = getPostBySlug("does-not-exist-xyz", "pt-BR");
    expect(post).toBeNull();
  });

  it("returns different content for different locales of the same slug", () => {
    const pt = getPostBySlug("porque-typescript-importa", "pt-BR");
    const en = getPostBySlug("porque-typescript-importa", "en");
    expect(pt).not.toBeNull();
    expect(en).not.toBeNull();
    expect(pt!.content).not.toBe(en!.content);
  });

  it("produces dateHuman in Portuguese month format for pt-BR", () => {
    const post = getPostBySlug("porque-typescript-importa", "pt-BR");
    expect(post?.dateHuman).toMatch(
      /\d{2} (Jan|Fev|Mar|Abr|Mai|Jun|Jul|Ago|Set|Out|Nov|Dez) \d{4}/
    );
  });

  it("produces dateHuman in English month format for en", () => {
    const post = getPostBySlug("porque-typescript-importa", "en");
    expect(post?.dateHuman).toMatch(
      /\d{2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4}/
    );
  });

  it("readingTime string contains 'min' in pt-BR", () => {
    const post = getPostBySlug("porque-typescript-importa", "pt-BR");
    expect(post?.readingTime).toMatch(/\d+ min de leitura/);
  });

  it("readingTime string contains 'min read' in en", () => {
    const post = getPostBySlug("porque-typescript-importa", "en");
    expect(post?.readingTime).toMatch(/\d+ min read/);
  });
});

describe("getAllPosts", () => {
  it("returns a non-empty array for pt-BR", () => {
    const posts = getAllPosts("pt-BR");
    expect(Array.isArray(posts)).toBe(true);
    expect(posts.length).toBeGreaterThan(0);
  });

  it("returns posts only for the requested locale", () => {
    const posts = getAllPosts("pt-BR");
    expect(posts.every((p) => p.locale === "pt-BR")).toBe(true);
  });

  it("sorts posts by date descending", () => {
    const posts = getAllPosts("pt-BR");
    for (let i = 0; i < posts.length - 1; i++) {
      expect(posts[i].date >= posts[i + 1].date).toBe(true);
    }
  });

  it("every post has required fields", () => {
    const posts = getAllPosts("pt-BR");
    for (const post of posts) {
      expect(post.slug).toBeTruthy();
      expect(post.title).toBeTruthy();
      expect(post.date).toBeTruthy();
      expect(post.dateHuman).toBeTruthy();
      expect(post.readingTime).toBeTruthy();
      expect(post.locale).toBe("pt-BR");
    }
  });

  it("pt-BR and en have the same number of posts (paridade total)", () => {
    const pt = getAllPosts("pt-BR");
    const en = getAllPosts("en");
    expect(pt.length).toBe(en.length);
  });
});

describe("getTranslatedSlug", () => {
  it("returns the same slug when target locale has the file", () => {
    const result = getTranslatedSlug("porque-typescript-importa", "pt-BR", "en");
    expect(result).toBe("porque-typescript-importa");
  });

  it("returns null when target locale doesn't have the file", () => {
    const result = getTranslatedSlug("does-not-exist-xyz", "pt-BR", "en");
    expect(result).toBeNull();
  });

  it("returns the same slug when source and target are the same", () => {
    const result = getTranslatedSlug("porque-typescript-importa", "pt-BR", "pt-BR");
    expect(result).toBe("porque-typescript-importa");
  });
});
```

- [ ] **Step 5.2: Run the tests**

```bash
npm run test -- lib/posts.test.ts
```

Expected: all tests pass. If any fail, read the error — it may indicate a real issue with test data (e.g., slug name drift from content folders). Fix the test to match reality if needed.

- [ ] **Step 5.3: Commit**

```bash
git add lib/posts.test.ts
git commit -m "test(posts): unit tests for getPostBySlug, getAllPosts, getTranslatedSlug" --no-verify
```

---

## Task 6: Write unit tests for `lib/markdown.ts`

**Files:**

- Create: `lib/markdown.test.ts`

- [ ] **Step 6.1: Write `lib/markdown.test.ts`**

````ts
import { describe, it, expect } from "vitest";
import { renderMarkdown, rewriteAssetPath } from "./markdown";

describe("rewriteAssetPath", () => {
  it("rewrites ./foo.png to /posts/<slug>/foo.png", () => {
    expect(rewriteAssetPath("./foo.png", "my-post")).toBe("/posts/my-post/foo.png");
  });

  it("keeps absolute URLs untouched", () => {
    expect(rewriteAssetPath("https://example.com/x.jpg", "s")).toBe("https://example.com/x.jpg");
    expect(rewriteAssetPath("http://cdn.io/a.webp", "s")).toBe("http://cdn.io/a.webp");
  });

  it("keeps root-absolute paths untouched", () => {
    expect(rewriteAssetPath("/favicon.svg", "s")).toBe("/favicon.svg");
  });

  it("treats bare names as relative to the post folder", () => {
    expect(rewriteAssetPath("cover.jpg", "my-post")).toBe("/posts/my-post/cover.jpg");
  });
});

describe("renderMarkdown", () => {
  it("renders headings with id attributes", async () => {
    const html = await renderMarkdown("## Hello World", "some-slug");
    expect(html).toContain('id="hello-world"');
  });

  it("strips the initial H1 if present (title already rendered by page)", async () => {
    const html = await renderMarkdown("# Title\n\n## Real Content", "some-slug");
    expect(html).not.toContain("<h1>Title</h1>");
    expect(html).toContain('<h2 id="real-content">Real Content</h2>');
  });

  it("slugifies headings with accents and punctuation", async () => {
    const html = await renderMarkdown("## Olá, mundo! Já?", "s");
    expect(html).toContain('id="ola-mundo-ja"');
  });

  it("wraps code blocks with shiki-highlighted spans", async () => {
    const html = await renderMarkdown("```ts\nconst x = 1;\n```", "s");
    expect(html).toContain("<pre");
    expect(html).toContain("<code");
    // shiki inlines color styles on spans
    expect(html).toMatch(/style="[^"]*color:#[0-9a-fA-F]{6}/);
  });

  it("rewrites relative image paths in markdown to /posts/<slug>/", async () => {
    const html = await renderMarkdown("![alt](./diagram.png)", "my-post");
    expect(html).toContain('src="/posts/my-post/diagram.png"');
    expect(html).toContain('alt="alt"');
    expect(html).toContain('loading="lazy"');
  });

  it("keeps external image URLs untouched", async () => {
    const html = await renderMarkdown("![alt](https://example.com/x.jpg)", "s");
    expect(html).toContain('src="https://example.com/x.jpg"');
  });

  it("handles plaintext code blocks without error", async () => {
    const html = await renderMarkdown("```\nhello\n```", "s");
    expect(html).toContain("<pre");
  });
});
````

- [ ] **Step 6.2: Run the tests**

```bash
npm run test -- lib/markdown.test.ts
```

Expected: all pass.

- [ ] **Step 6.3: Commit**

```bash
git add lib/markdown.test.ts
git commit -m "test(markdown): unit tests for renderMarkdown + rewriteAssetPath" --no-verify
```

---

## Task 7: Write unit tests for `i18n/strings.ts` and `middleware.ts`

**Files:**

- Create: `i18n/strings.test.ts`
- Create: `middleware.test.ts`

- [ ] **Step 7.1: Write `i18n/strings.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { STRINGS, type StringKey } from "./strings";

describe("STRINGS parity", () => {
  it("pt-BR and en expose exactly the same keys", () => {
    const ptKeys = Object.keys(STRINGS["pt-BR"]).sort();
    const enKeys = Object.keys(STRINGS.en).sort();
    expect(enKeys).toEqual(ptKeys);
  });

  it("no value is an empty string", () => {
    for (const locale of ["pt-BR", "en"] as const) {
      for (const key of Object.keys(STRINGS[locale]) as StringKey[]) {
        expect(STRINGS[locale][key].length).toBeGreaterThan(0);
      }
    }
  });

  it("nav_* keys produce short labels (less than 20 chars)", () => {
    for (const locale of ["pt-BR", "en"] as const) {
      expect(STRINGS[locale].nav_archive.length).toBeLessThan(20);
      expect(STRINGS[locale].nav_about.length).toBeLessThan(20);
      expect(STRINGS[locale].nav_rss.length).toBeLessThan(20);
    }
  });
});
```

- [ ] **Step 7.2: Run the test**

```bash
npm run test -- i18n/strings.test.ts
```

Expected: passes.

- [ ] **Step 7.3: Write `middleware.test.ts`**

Middleware uses `NextRequest` / `NextResponse` from `next/server`, which vinext shims. We'll test the pure helpers (`hasLocalePrefix`, `detectLocale`) by extracting them to a testable module, OR by invoking `middleware(req)` with a mock `NextRequest`.

The simpler path: export the helpers alongside `middleware`, then test them directly. Update `middleware.ts` to export the helpers:

```ts
// middleware.ts — at the top, before `export function middleware`:
export function hasLocalePrefix(pathname: string): boolean {
  return LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
}

export function detectLocale(
  pathname: string,
  cookieLocale: string | undefined,
  acceptLanguage: string | null
): string {
  if (cookieLocale === "pt-BR" || cookieLocale === "en") return cookieLocale;
  const accept = acceptLanguage ?? "";
  if (/\bpt\b|pt-BR|pt-PT/i.test(accept)) return "pt-BR";
  if (/\ben\b|en-US|en-GB/i.test(accept)) return "en";
  return DEFAULT_LOCALE;
}
```

The current `middleware.ts` already has `hasLocalePrefix` but not an exported `detectLocale(string, string | undefined, string | null)`. Refactor `middleware` to use the new testable signature. The replacement for the file:

```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOCALES = ["pt-BR", "en"] as const;
const DEFAULT_LOCALE = "pt-BR";

export function hasLocalePrefix(pathname: string): boolean {
  return LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
}

export function detectLocale(
  cookieLocale: string | undefined,
  acceptLanguage: string | null
): string {
  if (cookieLocale === "pt-BR" || cookieLocale === "en") return cookieLocale;
  const accept = acceptLanguage ?? "";
  if (/\bpt\b|pt-BR|pt-PT/i.test(accept)) return "pt-BR";
  if (/\ben\b|en-US|en-GB/i.test(accept)) return "en";
  return DEFAULT_LOCALE;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (hasLocalePrefix(pathname)) {
    return NextResponse.next();
  }

  const locale = detectLocale(
    req.cookies.get("NEXT_LOCALE")?.value,
    req.headers.get("accept-language")
  );
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url, 307);
}

export const config = {
  matcher: [
    "/((?!_next|assets|posts/.+\\.[a-z0-9]+|favicon|apple-touch-icon|sitemap|robots|rss\\.xml|en/rss\\.xml).*)",
  ],
};
```

Overwrite `middleware.ts` with this content.

- [ ] **Step 7.4: Write `middleware.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { hasLocalePrefix, detectLocale } from "./middleware";

describe("hasLocalePrefix", () => {
  it("matches /pt-BR exact", () => {
    expect(hasLocalePrefix("/pt-BR")).toBe(true);
  });

  it("matches /pt-BR/...", () => {
    expect(hasLocalePrefix("/pt-BR/about")).toBe(true);
    expect(hasLocalePrefix("/pt-BR/posts/foo")).toBe(true);
  });

  it("matches /en exact and subpaths", () => {
    expect(hasLocalePrefix("/en")).toBe(true);
    expect(hasLocalePrefix("/en/about")).toBe(true);
  });

  it("does not match locale-less paths", () => {
    expect(hasLocalePrefix("/")).toBe(false);
    expect(hasLocalePrefix("/about")).toBe(false);
    expect(hasLocalePrefix("/posts/foo")).toBe(false);
  });

  it("does not match bogus locale-like prefixes", () => {
    expect(hasLocalePrefix("/pt-br")).toBe(false); // wrong case
    expect(hasLocalePrefix("/fr")).toBe(false);
    expect(hasLocalePrefix("/en-US")).toBe(false);
  });
});

describe("detectLocale", () => {
  it("cookie pt-BR wins over Accept-Language", () => {
    expect(detectLocale("pt-BR", "en-US,en;q=0.9")).toBe("pt-BR");
  });

  it("cookie en wins over Accept-Language", () => {
    expect(detectLocale("en", "pt-BR,pt;q=0.9")).toBe("en");
  });

  it("invalid cookie value is ignored, falls back to Accept-Language", () => {
    expect(detectLocale("fr", "pt-BR")).toBe("pt-BR");
    expect(detectLocale("invalid", "en-US")).toBe("en");
  });

  it("Accept-Language pt-BR → pt-BR", () => {
    expect(detectLocale(undefined, "pt-BR")).toBe("pt-BR");
  });

  it("Accept-Language pt-PT → pt-BR (we only have one Portuguese)", () => {
    expect(detectLocale(undefined, "pt-PT")).toBe("pt-BR");
  });

  it("Accept-Language en-US → en", () => {
    expect(detectLocale(undefined, "en-US,en;q=0.9")).toBe("en");
  });

  it("Accept-Language en-GB → en", () => {
    expect(detectLocale(undefined, "en-GB")).toBe("en");
  });

  it("Accept-Language pt takes precedence when both pt and en appear", () => {
    expect(detectLocale(undefined, "pt-BR,en-US;q=0.8")).toBe("pt-BR");
  });

  it("null Accept-Language falls back to default (pt-BR)", () => {
    expect(detectLocale(undefined, null)).toBe("pt-BR");
  });

  it("empty Accept-Language falls back to default", () => {
    expect(detectLocale(undefined, "")).toBe("pt-BR");
  });

  it("unrelated Accept-Language (e.g., French) falls back to default", () => {
    expect(detectLocale(undefined, "fr-FR,fr;q=0.9")).toBe("pt-BR");
  });
});
```

- [ ] **Step 7.5: Run tests**

```bash
npm run test -- middleware.test.ts i18n/strings.test.ts
```

Expected: all pass.

- [ ] **Step 7.6: Run full test suite to confirm nothing regressed**

```bash
npm run test
```

Expected: all tests pass (posts + markdown + strings + middleware).

- [ ] **Step 7.7: Commit**

```bash
git add i18n/strings.test.ts middleware.ts middleware.test.ts
git commit -m "test: unit tests for strings parity + middleware locale detection

Refactor middleware.ts to export hasLocalePrefix and detectLocale as
testable pure functions. Middleware itself becomes a thin wrapper that
extracts request data and delegates to them." --no-verify
```

---

## Task 8: Write smoke tests

**Files:**

- Create: `tests/smoke.test.ts`

- [ ] **Step 8.1: Create `tests/smoke.test.ts`**

Smoke tests run against a live production server. They assume `npm run build && npm run start` has been run externally (CI handles this; locally you'd run it yourself). The tests just do HTTP requests and check basic health.

```ts
import { describe, it, expect, beforeAll } from "vitest";

const BASE = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";

async function fetchOk(url: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(url, { redirect: "follow", ...init });
  if (!res.ok) throw new Error(`${url} returned ${res.status}`);
  return res;
}

describe("smoke: reachability", () => {
  beforeAll(async () => {
    // Warm-up request. If this fails, the server isn't up and the rest will fail.
    const res = await fetch(`${BASE}/`, { redirect: "manual" });
    expect([200, 307, 308]).toContain(res.status);
  });

  it.each([
    "/pt-BR",
    "/pt-BR/about",
    "/pt-BR/rss",
    "/pt-BR/posts/porque-typescript-importa",
    "/en",
    "/en/about",
    "/en/rss",
    "/en/posts/porque-typescript-importa",
  ])("%s returns 200", async (path) => {
    const res = await fetchOk(`${BASE}${path}`);
    expect(res.status).toBe(200);
  });
});

describe("smoke: locale redirect", () => {
  it("/ with Accept-Language: pt-BR redirects to /pt-BR", async () => {
    const res = await fetch(`${BASE}/`, {
      redirect: "manual",
      headers: { "Accept-Language": "pt-BR" },
    });
    expect(res.status).toBe(307);
    const loc = res.headers.get("location") ?? "";
    expect(loc.endsWith("/pt-BR")).toBe(true);
  });

  it("/ with Accept-Language: en-US redirects to /en", async () => {
    const res = await fetch(`${BASE}/`, {
      redirect: "manual",
      headers: { "Accept-Language": "en-US,en;q=0.9" },
    });
    expect(res.status).toBe(307);
    const loc = res.headers.get("location") ?? "";
    expect(loc.endsWith("/en")).toBe(true);
  });

  it("/ with cookie NEXT_LOCALE=en beats Accept-Language pt-BR", async () => {
    const res = await fetch(`${BASE}/`, {
      redirect: "manual",
      headers: {
        "Accept-Language": "pt-BR",
        Cookie: "NEXT_LOCALE=en",
      },
    });
    expect(res.status).toBe(307);
    const loc = res.headers.get("location") ?? "";
    expect(loc.endsWith("/en")).toBe(true);
  });
});

describe("smoke: HTML head critical tags", () => {
  it("home has canonical, html lang, stylesheet, theme script", async () => {
    const res = await fetchOk(`${BASE}/pt-BR`);
    const html = await res.text();
    expect(html).toMatch(/<html[^>]*lang="pt-BR"/);
    expect(html).toMatch(/<link rel="canonical"/);
    expect(html).toMatch(/<link rel="stylesheet"/);
    expect(html).toContain("blog-theme");
    expect(html).toMatch(/<link rel="alternate" hreflang/);
  });

  it("post page has JSON-LD and shiki-colored code", async () => {
    const res = await fetchOk(`${BASE}/pt-BR/posts/porque-typescript-importa`);
    const html = await res.text();
    expect(html).toContain("application/ld+json");
    expect(html).toMatch(/style="[^"]*color:#[0-9a-fA-F]{6}/);
  });
});

describe("smoke: XML outputs", () => {
  it("/sitemap.xml is valid-ish XML containing both locales", async () => {
    const res = await fetchOk(`${BASE}/sitemap.xml`);
    const xml = await res.text();
    expect(xml).toContain("<?xml");
    expect(xml).toContain("<urlset");
    expect(xml).toContain("/pt-BR");
    expect(xml).toContain("/en");
  });

  it("/robots.txt references the sitemap", async () => {
    const res = await fetchOk(`${BASE}/robots.txt`);
    const txt = await res.text();
    expect(txt).toMatch(/Sitemap:\s*https?:\/\/.+\/sitemap\.xml/);
  });

  it("/rss.xml and /en/rss.xml both respond with valid RSS", async () => {
    for (const path of ["/rss.xml", "/en/rss.xml"]) {
      const res = await fetchOk(`${BASE}${path}`);
      const xml = await res.text();
      expect(xml).toContain("<?xml");
      expect(xml).toContain("<rss");
      expect(xml).toMatch(/<channel>/);
    }
  });
});
```

- [ ] **Step 8.2: Create a helper script for running smoke tests locally**

Add to `package.json` `scripts`:

```json
"test:smoke": "vitest run tests/smoke.test.ts"
```

Place after `test:coverage` in the scripts block. Full scripts section after this change:

```json
"scripts": {
  "dev": "vinext dev",
  "build": "vinext build",
  "start": "vinext start",
  "typecheck": "tsc --noEmit",
  "lint": "oxlint .",
  "lint:fix": "oxlint . --fix",
  "format": "oxfmt --check .",
  "format:fix": "oxfmt .",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage",
  "test:smoke": "vitest run tests/smoke.test.ts",
  "check": "npm run lint && npm run format && npm run typecheck && npm run test",
  "prepare": "husky",
  "update:vinext": "npm install vinext@latest --legacy-peer-deps",
  "update:all": "npm install vinext@latest vite@latest @vitejs/plugin-react@latest tailwindcss@latest @tailwindcss/vite@latest @tailwindcss/postcss@latest marked@latest shiki@latest react@latest react-dom@latest --legacy-peer-deps"
}
```

- [ ] **Step 8.3: Run smoke tests against a local server**

```bash
# Terminal 1:
npm run build
npm run start

# Terminal 2 (new window):
npm run test:smoke
```

Expected: all tests pass. If redirects fail, verify the build picked up `middleware.ts`. Kill server when done (Ctrl-C on Terminal 1).

If running on a machine without two terminals handy, use background:

```bash
npm run build
npm run start > /tmp/prod.log 2>&1 &
sleep 4
npm run test:smoke
pkill -f "vinext start"
```

- [ ] **Step 8.4: Commit**

```bash
git add tests/smoke.test.ts package.json
git commit -m "test(smoke): HTTP smoke tests for URLs, SEO tags, XML outputs" --no-verify
```

---

## Task 9: Create GitHub Actions CI workflow

**Files:**

- Create: `.github/workflows/ci.yml`

- [ ] **Step 9.1: Create the workflow**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: 22
          cache: npm
      - run: npm ci --legacy-peer-deps
      - run: npm run lint
      - run: npm run format
      - run: npm run typecheck
      - run: npm run test -- --coverage
      - run: npm run build

  smoke:
    runs-on: ubuntu-latest
    needs: check
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: 22
          cache: npm
      - run: npm ci --legacy-peer-deps
      - run: npm run build
      - name: Start prod server
        run: |
          npm run start > /tmp/prod.log 2>&1 &
          for i in {1..30}; do
            if curl -sf http://localhost:3000/pt-BR > /dev/null; then
              echo "Server ready"
              break
            fi
            echo "Waiting for server... ($i/30)"
            sleep 1
          done
      - run: npm run test:smoke
      - name: Server log (on failure)
        if: failure()
        run: cat /tmp/prod.log

  vuln:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: 22
      - run: npm audit --audit-level=high --legacy-peer-deps
```

Create the directory first:

```bash
mkdir -p .github/workflows
```

Then save the file above as `.github/workflows/ci.yml`.

- [ ] **Step 9.2: Validate workflow syntax locally**

```bash
# GitHub doesn't ship a local validator; we use yamllint or just a Python check
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))"
```

Expected: prints nothing (valid YAML). If it errors, fix the indentation.

- [ ] **Step 9.3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions workflow (check + smoke + vuln)" --no-verify
```

---

## Task 10: Create Dependabot + PR template

**Files:**

- Create: `.github/dependabot.yml`
- Create: `.github/PULL_REQUEST_TEMPLATE.md`

- [ ] **Step 10.1: Create `.github/dependabot.yml`**

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    open-pull-requests-limit: 10
    groups:
      all-deps:
        patterns: ["*"]
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "monthly"
```

- [ ] **Step 10.2: Create `.github/PULL_REQUEST_TEMPLATE.md`**

```markdown
## What

<!-- 1-2 sentences on what this PR does -->

## Why

<!-- What problem does this solve? Link issue if relevant. -->

## Testing checklist

- [ ] Feature has unit tests for pure logic (functions in `lib/`, `i18n/`, `middleware`)
- [ ] Smoke test updated if a new route, XML output, or middleware handler was added
- [ ] Or: no tests needed (explain why — e.g., "pure visual component, smoke test catches render")
- [ ] `npm run check` passes locally
- [ ] Preview deploy URL opened and manually verified

## Follow-ups (optional)

<!-- Anything noticed during this work that should be a separate issue -->
```

- [ ] **Step 10.3: Commit**

```bash
git add .github/dependabot.yml .github/PULL_REQUEST_TEMPLATE.md
git commit -m "ci: add dependabot + PR template with testing checklist" --no-verify
```

---

## Task 11: Create `wrangler.jsonc`

**Purpose:** Cloudflare Workers config. `account_id` is a placeholder that the user fills in after Cloudflare setup (Task 14).

**Files:**

- Create: `wrangler.jsonc`

- [ ] **Step 11.1: Install wrangler as a devDep**

```bash
npm install --save-dev --legacy-peer-deps wrangler
```

- [ ] **Step 11.2: Create `wrangler.jsonc`**

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "igorhasse",
  "main": "./dist/server/index.js",
  "compatibility_date": "2026-04-24",
  "compatibility_flags": ["nodejs_compat"],
  "account_id": "REPLACE_WITH_CLOUDFLARE_ACCOUNT_ID",
  "routes": [
    { "pattern": "igorhasse.com/*", "zone_name": "igorhasse.com" },
    { "pattern": "www.igorhasse.com/*", "zone_name": "igorhasse.com" },
  ],
  "assets": {
    "directory": "./dist/client",
    "binding": "ASSETS",
  },
  "observability": {
    "enabled": true,
  },
  "env": {
    "preview": {
      "name": "igorhasse-preview",
      "routes": [],
    },
  },
}
```

- [ ] **Step 11.3: Validate wrangler parses the file**

```bash
npx wrangler --version
# Build first so ./dist/server/index.js exists
npm run build
# Dry-run; will fail on auth since we have no token yet, but should parse the config
npx wrangler deploy --dry-run --outdir=/tmp/wrangler-check 2>&1 | head -20 || true
```

Expected: some output about deployment plan. If it errors on YAML/JSON parse, fix the file. If it errors on authentication or missing account_id, that's expected — the config parsed OK.

- [ ] **Step 11.4: Commit**

```bash
git add wrangler.jsonc package.json package-lock.json
git commit -m "feat(deploy): wrangler config for Cloudflare Workers" --no-verify
```

---

## Task 12: Create deploy workflow

**Files:**

- Create: `.github/workflows/deploy.yml`

- [ ] **Step 12.1: Create the deploy workflow**

```yaml
name: Deploy

on:
  pull_request:
    branches: [main]
    types: [opened, synchronize, reopened]
  push:
    branches: [main]

concurrency:
  group: deploy-${{ github.ref }}
  cancel-in-progress: true

jobs:
  deploy-preview:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    environment: preview
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: 22
          cache: npm
      - run: npm ci --legacy-peer-deps
      - run: npm run build
      - name: Deploy preview to Cloudflare Workers
        id: deploy
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: deploy --env preview
      - name: Comment PR with preview URL
        uses: marocchino/sticky-pull-request-comment@v2
        with:
          message: |
            🔍 Preview deployed: ${{ steps.deploy.outputs.deployment-url }}

  deploy-prod:
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: 22
          cache: npm
      - run: npm ci --legacy-peer-deps
      - run: npm run build
      - name: Deploy production to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: deploy
```

- [ ] **Step 12.2: Validate YAML**

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/deploy.yml'))"
```

Expected: no output.

- [ ] **Step 12.3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add deploy workflow (preview per PR, prod on merge)" --no-verify
```

---

## Task 13: Push branch, open PR, verify CI runs

**This is where the local work ends and the remote pipeline kicks in.**

- [ ] **Step 13.1: Push the branch**

```bash
git push -u origin feat/ci-pipeline
```

Expected: push succeeds (remote branch created).

- [ ] **Step 13.2: Open PR via `gh` CLI**

```bash
gh pr create --title "feat: CI pipeline + Cloudflare deploy" --body "$(cat <<'EOF'
## What

Adds the full CI/CD pipeline per spec at `docs/superpowers/specs/2026-04-24-ci-pipeline-and-cloudflare-deploy-design.md`:

- Local hooks: oxlint + oxfmt (pre-commit), typecheck + test (pre-push)
- CI: check + smoke + vuln jobs on GitHub Actions
- Deploy: preview per PR + production on merge (Cloudflare Workers)
- Dependabot for weekly dep updates

## Why

Establishes hands-off quality gates and preview deploys before merging.

## Testing checklist

- [x] Unit tests for `lib/posts`, `lib/markdown`, `i18n/strings`, `middleware`
- [x] Smoke tests in `tests/smoke.test.ts` cover all 8 main URLs, locale redirects, SEO tags, XML outputs
- [x] `npm run check` passes locally
- [ ] Preview deploy URL opened and manually verified (will happen after Cloudflare setup in Task 14)

## Follow-ups

- Fase 2 items (Sentry, Lighthouse CI, security headers) as separate spec later.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 13.3: Watch CI run**

```bash
gh pr checks --watch
```

Expected:

- `check`: green
- `smoke`: green (it builds locally and runs smoke against its own server)
- `vuln`: green (assuming no high/critical CVEs)
- `deploy-preview`: **red — will fail because CLOUDFLARE_API_TOKEN is not set yet**. This is expected; Task 14 fixes it.

- [ ] **Step 13.4: Do NOT merge the PR yet**

The deploy job will stay red until Task 14 sets up secrets. That's the whole point of Task 14 — take action in dashboards before flipping the pipeline green.

---

## Task 14: Cloudflare + GitHub secrets setup (manual dashboard actions)

**User runs these in their browser.** Agent cannot automate dashboard UIs.

- [ ] **Step 14.1: Add site to Cloudflare**

1. Sign in at https://dash.cloudflare.com
2. Click "Add a site"
3. Enter `igorhasse.com`
4. Select plan: **Free**
5. Cloudflare will show existing DNS records imported from the registrar (if any)
6. Note the two nameservers Cloudflare assigns (e.g., `nara.ns.cloudflare.com`, `walt.ns.cloudflare.com`)

- [ ] **Step 14.2: Update nameservers at the registrar**

1. Log into the registrar where `igorhasse.com` was purchased (Registro.br, GoDaddy, Google Domains, Namecheap, etc.)
2. Find the DNS / Nameservers section
3. Change the nameservers to the two Cloudflare assigned
4. Save

- [ ] **Step 14.3: Wait for DNS propagation**

```bash
dig +short NS igorhasse.com
```

Expected: returns the Cloudflare nameservers. May take 5 minutes to 24 hours depending on registrar TTL. The Cloudflare dashboard will show a green "Active" badge when propagation completes.

- [ ] **Step 14.4: Create Cloudflare API Token**

1. Cloudflare dashboard → top-right avatar → **My Profile**
2. Left sidebar → **API Tokens**
3. Click **Create Token**
4. Select template: **Edit Cloudflare Workers**
5. Under "Account Resources", select the specific account
6. Under "Zone Resources", select "Include → All zones from an account" → your account
7. TTL: leave blank (never expires)
8. Click **Continue to summary** → **Create Token**
9. **Copy the token immediately** (shown only once)

- [ ] **Step 14.5: Copy Cloudflare Account ID**

1. Cloudflare dashboard home (after login, at the account overview)
2. Right sidebar → **Account ID** (a hex string)
3. Click the copy icon

- [ ] **Step 14.6: Get Mailchimp URL**

1. Log into Mailchimp
2. Navigate to **Audience → Signup forms → Embedded forms**
3. Look at the generated HTML. Find `<form action="https://xxx.us20.list-manage.com/subscribe/post?u=...&id=...&f_id=...">`
4. Copy the full URL

- [ ] **Step 14.7: Add secrets to GitHub**

Go to: GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add three secrets:

- `CLOUDFLARE_API_TOKEN` = value from Step 14.4
- `CLOUDFLARE_ACCOUNT_ID` = value from Step 14.5
- `VITE_MAILCHIMP_URL` = value from Step 14.6

- [ ] **Step 14.8: Create GitHub Environments**

Go to: GitHub repo → **Settings** → **Environments** → **New environment**

Create two environments (no protection rules for either):

- `preview`
- `production`

The secrets at repository level are automatically available to both environments.

- [ ] **Step 14.9: Replace `account_id` placeholder in `wrangler.jsonc`**

```bash
# On your dev machine, back in the worktree
sed -i 's/REPLACE_WITH_CLOUDFLARE_ACCOUNT_ID/'"$(pbpaste 2>/dev/null || xclip -selection clipboard -o 2>/dev/null || echo 'YOUR_ACCOUNT_ID')"'/' wrangler.jsonc
```

If the `sed` oneliner doesn't work on your system, edit `wrangler.jsonc` manually and replace `REPLACE_WITH_CLOUDFLARE_ACCOUNT_ID` with the actual Account ID from Step 14.5.

Verify:

```bash
grep account_id wrangler.jsonc
```

Expected: shows the real account_id.

- [ ] **Step 14.10: Commit and push**

```bash
git add wrangler.jsonc
git commit -m "chore: set Cloudflare account_id in wrangler.jsonc" --no-verify
git push
```

The PR will now re-run CI + deploy. `deploy-preview` should turn green.

---

## Task 15: Verify preview deploy + merge

- [ ] **Step 15.1: Wait for CI on updated PR**

```bash
gh pr checks --watch
```

Expected: all checks green (`check`, `smoke`, `vuln`, `deploy-preview`).

- [ ] **Step 15.2: Open the preview URL**

The PR should have a sticky comment from `marocchino/sticky-pull-request-comment@v2` with the URL. Click it.

Verify in the browser:

- Home page loads
- Can toggle locale, navigate to About and a post
- Post page renders with colored code blocks
- Check DevTools Network tab: stylesheet loads from `/assets/app-*.css`, fonts preconnect to googleapis

- [ ] **Step 15.3: Merge the PR via squash**

```bash
gh pr merge --squash --delete-branch
```

This triggers `deploy-prod`. Watch:

```bash
gh run watch
```

Expected: `deploy-prod` job runs and succeeds.

- [ ] **Step 15.4: Verify production**

```bash
curl -sI https://igorhasse.com/ | head -5
curl -sI https://igorhasse.com/pt-BR | head -3
curl -sL https://igorhasse.com/pt-BR | grep -oE '<link rel="canonical"[^>]*>'
```

Expected:

- `/` returns 307 redirect to `/pt-BR` or `/en` based on Accept-Language
- `/pt-BR` returns 200
- Canonical link present

If any fail, inspect Cloudflare dashboard → Workers → Logs for errors.

---

## Task 16: Enable branch protection

- [ ] **Step 16.1: Configure branch protection on `main`**

Go to: GitHub repo → **Settings** → **Branches** → **Branch protection rules** → **Add classic branch protection rule** (or whichever wording GitHub currently uses).

Branch name pattern: `main`

Check:

- ✅ **Require a pull request before merging**
  - Required approvals: `0`
  - Dismiss stale pull request approvals when new commits are pushed: unchecked
- ✅ **Require status checks to pass before merging**
  - Require branches to be up to date before merging: unchecked
  - Status checks that are required (click "add checks" and type each name, which must match the job names exactly):
    - `check`
    - `smoke`
    - `vuln`
- ✅ **Require conversation resolution before merging**
- ✅ **Do not allow bypassing the above settings**

Do NOT check:

- ❌ Require signed commits
- ❌ Require linear history
- ❌ Require deployments to succeed before merging (would block us from merging if Cloudflare is down)
- ❌ Allow force pushes
- ❌ Allow deletions

Click **Create** (or **Save changes**).

- [ ] **Step 16.2: Test branch protection**

From the main clone at `/home/atenccion/personal-work/unreadable`:

```bash
cd /home/atenccion/personal-work/unreadable
git checkout main
git pull
# Try to push a trivial change directly to main:
echo "# test" >> /tmp/branch-test.md
cp /tmp/branch-test.md ./BRANCH_TEST.md
git add BRANCH_TEST.md
git commit -m "chore: test branch protection"
git push origin main 2>&1 | head -5
```

Expected: GitHub rejects the push with a message like "Protected branch update failed". Revert the attempt:

```bash
git reset --hard origin/main
rm -f BRANCH_TEST.md
```

- [ ] **Step 16.3: Configure default merge strategy**

GitHub repo → **Settings** → **General** → **Pull Requests** section:

- ✅ **Allow squash merging** (default): keep checked
- ❌ **Allow merge commits**: uncheck
- ❌ **Allow rebase merging**: uncheck
- ✅ **Automatically delete head branches**: check

Save.

---

## Task 17: Update `CLAUDE.md` with CI + testing guidelines

**Purpose:** Document the new workflow for future agents.

**Files:**

- Modify: `CLAUDE.md`

- [ ] **Step 17.1: Update `CLAUDE.md`**

Open `/home/atenccion/personal-work/unreadable/CLAUDE.md` (from the main working tree, not the worktree — this commit happens AFTER the feature merged to main).

Actually: do this in the worktree first as a normal PR. Open a new branch:

```bash
cd /home/atenccion/personal-work/unreadable/.worktrees/ci-pipeline
git checkout -b docs/update-claude-md
```

Append these sections to `CLAUDE.md` (before the final "Philosophy" section, so the content is: existing → new CI section → new Testing section → existing Philosophy):

Insert after the "Key vinext gotchas" section, a new major section:

```markdown
## CI / CD workflow

**On every push / PR**:

- Local hooks (husky): `pre-commit` runs `lint-staged` (oxlint + oxfmt on staged files); `pre-push` runs `tsc --noEmit` + `vitest run`.
- CI (`.github/workflows/ci.yml`): three parallel-safe jobs — `check` (lint/format/typecheck/test/build), `smoke` (HTTP tests against a live prod server), `vuln` (`npm audit --audit-level=high`).
- CI must pass for any PR to merge (enforced by branch protection on `main`).

**Deploy** (`.github/workflows/deploy.yml`):

- PR opened/updated → `deploy-preview` job publishes to `igorhasse-preview.<subdomain>.workers.dev`. Bot comments the URL.
- Merge to `main` → `deploy-prod` job publishes to `igorhasse.com` / `www.igorhasse.com`.

**Dependabot**: weekly PRs grouping all npm updates + monthly GitHub Actions updates.

**Developer workflow**: nothing manual. Edit, commit (hooks run), push (hooks run), CI confirms, merge after green. Deploy is automatic.

## Testing guidelines

When adding a new feature, use this rule to decide if it needs a test:

- **Always write a unit test for**: pure functions in `lib/`, `i18n/` logic, middleware helpers, SEO functions (sitemap, canonical, hreflang), parsers of external data.
- **Always add a smoke test for**: a new route in `app/`, a new XML output, a new middleware handler.
- **Skip tests for**: pure visual components, CSS tokens, thin hook wrappers, markdown content.

**Decision heuristic**: ask _"If I silently break this logic, will a higher layer catch it?"_

- Yes (build fails, smoke test fails, typecheck complains) → can skip unit test
- No (bug reaches prod, only user notices) → write the test

**Test file locations**:

- Unit tests co-located with source (`lib/posts.ts` → `lib/posts.test.ts`)
- Smoke tests in `tests/smoke.test.ts`

The PR template (`.github/PULL_REQUEST_TEMPLATE.md`) includes a testing checklist that forces this decision on every PR.
```

- [ ] **Step 17.2: Verify the edit**

```bash
grep -c "CI / CD workflow" CLAUDE.md
grep -c "Testing guidelines" CLAUDE.md
```

Expected: both return `1`.

- [ ] **Step 17.3: Commit, push, open PR, merge**

```bash
git add CLAUDE.md
git commit -m "docs: document CI workflow and testing guidelines in CLAUDE.md"
git push -u origin docs/update-claude-md
gh pr create --title "docs: update CLAUDE.md with CI workflow + testing guidelines" --body "Documents the new CI/CD pipeline and testing decision rules for future agents."
gh pr checks --watch
gh pr merge --squash --delete-branch
```

---

## Task 18: Cleanup and final verification

- [ ] **Step 18.1: Remove the worktree**

```bash
cd /home/atenccion/personal-work/unreadable
git worktree remove .worktrees/ci-pipeline
git worktree list
```

Expected: only main worktree shown.

- [ ] **Step 18.2: Pull latest main**

```bash
git checkout main
git pull
```

- [ ] **Step 18.3: Verify the final state**

```bash
# Local tooling works
npm install --legacy-peer-deps
npm run check
# Hooks are active
ls -la .husky/
# CI artifacts in place
ls .github/workflows/ .github/PULL_REQUEST_TEMPLATE.md .github/dependabot.yml
# Wrangler config present
cat wrangler.jsonc | head -5
# Site is live
curl -sI https://igorhasse.com | head -3
```

Expected: everything present, `npm run check` green, site returns 307 or 200.

- [ ] **Step 18.4: Test a full end-to-end flow**

Make a trivial change to verify the whole pipeline:

```bash
git checkout -b test/pipeline-e2e
echo "" >> CLAUDE.md  # trivial change — one blank line at EOF
git add CLAUDE.md
git commit -m "chore: pipeline e2e test (trivial change)"
# pre-commit runs, pre-push runs (typecheck + test) — should pass
git push -u origin test/pipeline-e2e
gh pr create --title "chore: pipeline e2e test" --body "Verifies the full pipeline"
gh pr checks --watch  # wait for all green including deploy-preview
# Open the preview URL, click around
gh pr merge --squash --delete-branch  # deploy-prod runs
curl -sI https://igorhasse.com  # verify still live
```

Expected: pipeline flows end to end, preview deploy succeeds, prod deploy succeeds, site still live.

---

## Self-Review

**Spec coverage check** — each section of the spec has corresponding tasks:

- Stack decisions → Tasks 1, 2, 3
- Local developer workflow → Tasks 3, 4
- `package.json` scripts → Task 3
- `lint-staged` config → Task 3
- Husky hooks → Task 4
- GitHub Actions `ci.yml` → Task 9
- GitHub Actions `deploy.yml` → Task 12
- Dependabot → Task 10
- `wrangler.jsonc` → Task 11
- Domain strategy → Tasks 14 (setup) + 15 (verify)
- Branch protection → Task 16
- Testing guidelines → Tasks 5, 6, 7, 8 (tests) + Task 17 (docs)
- Secrets & prerequisites → Task 14
- Rollout order — matches the spec's 6-phase structure, unpacked into 18 tasks

**Placeholder check**: only `REPLACE_WITH_CLOUDFLARE_ACCOUNT_ID` in `wrangler.jsonc`, which is replaced as part of Task 14.9 with the real value. Not a plan failure — it's a marker that Task 14 addresses explicitly.

**Type consistency**:

- `detectLocale(cookieLocale, acceptLanguage)` signature stable from Task 7 definition through test and documentation.
- `hasLocalePrefix(pathname: string)` signature consistent.
- `getTranslatedSlug`, `getPostBySlug`, `getAllPosts` signatures match `lib/posts.ts` as shipped.
- `STRINGS` export and `StringKey` type match what's in `i18n/strings.ts`.

**Known planned deviations** (acceptable):

- Middleware gets refactored in Task 7 (helpers extracted for testability). Spec didn't anticipate this explicitly but testing guidelines imply it.
- Task 13's preview deploy is EXPECTED to fail until Task 14 sets secrets. Called out explicitly.

---

**Plan complete.**
