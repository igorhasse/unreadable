# CI Pipeline & Cloudflare Deploy — Design

**Date:** 2026-04-24
**Status:** Approved by user, pending implementation plan
**Scope:** Add a complete CI/CD pipeline (lint, tests, vulnerability scan, preview + production deploy) and configure Cloudflare Workers hosting for the blog.

---

## Context

The blog just finished migrating to App Router on vinext 0.0.43. Today there is no automation:
- No linter configured
- No test runner
- No CI workflows
- No branch protection
- No Cloudflare deploy configured (domain owned, not yet attached)

Everything ships via manual `npm run build` + local inspection. This spec establishes a hands-off pipeline so that "push a branch → get validated → merge → auto-deploy to production" becomes the normal flow. The developer should not need to run anything manually — pre-commit and pre-push hooks handle local validation; GitHub Actions handle remote CI + deploy; Cloudflare Workers hosts the live site on the free tier.

## Goals

- **Zero manual commands in the day-to-day workflow.** Commit and push — hooks run lint/format/typecheck/test automatically.
- **Main branch is never broken.** Branch protection forces all changes through PR with passing CI.
- **Every PR gets a preview deployment.** Visual verification before merge.
- **Every merge to main deploys to production automatically.** Zero-downtime via Cloudflare Workers.
- **Vulnerabilities surface as PRs.** Dependabot + `npm audit` in CI.
- **Clear rules for when new code needs tests.** Documented for future features.

## Non-goals (future follow-ups, not this spec)

- Sentry / error tracking in production
- Security headers (CSP, HSTS) beyond middleware defaults
- Lighthouse CI / performance budgets
- Playwright E2E tests
- Coverage thresholds
- Conventional commits / commitlint / semantic-release
- Staging environment separate from preview

All listed as phase-2 follow-ups. Pick them up when the pipeline is stable.

## Stack decisions

| Concern | Tool | Rationale |
|---|---|---|
| Lint | `oxlint` | Same linter vinext uses internally. ~50-100x faster than ESLint. Zero-config to start. |
| Format | `oxfmt` | Companion to oxlint. |
| Typecheck | `tsc --noEmit` | Already in use. No change. |
| Unit tests | `vitest` | First-class Vite ecosystem tool, reuses the existing `vite.config.ts`. |
| Smoke tests | `vitest` (HTTP fetches) | Same runner; keeps test infra single-tool. |
| Vuln scan | `npm audit` + GitHub Dependabot | Free, built-in, sufficient for a personal blog. |
| Pre-commit hooks | `husky` + `lint-staged` | Standard; runs lint/format only on staged files. |
| CI | GitHub Actions | Repo is on GitHub. No other option makes sense. |
| Deploy target | Cloudflare Workers (free tier) | 100k req/day free, instant rollback, global CDN. Native vinext support. |
| Deploy tool | `wrangler` via `cloudflare/wrangler-action@v3` | Official, maintained. |

Node version pinned: **22 LTS**.

## Architecture

### Local developer workflow

```
edit code
  ↓
git add <files>
  ↓
git commit
  ├─ husky pre-commit → lint-staged
  │   ├─ *.{ts,tsx,js,jsx}: oxlint --fix + oxfmt
  │   └─ *.{json,md,css}: oxfmt
  │   (re-stages fixes)
  ↓
git push
  ├─ husky pre-push
  │   ├─ tsc --noEmit
  │   └─ vitest run
  ↓
CI runs on GitHub (full suite + build + smoke + vuln)
  ↓
deploy preview (PR) or prod (main)
```

### `package.json` scripts

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
  "update:vinext": "...",
  "update:all": "..."
}
```

### `lint-staged` config (in `package.json`)

```json
"lint-staged": {
  "*.{ts,tsx,js,jsx}": ["oxlint --fix", "oxfmt"],
  "*.{json,md,css}": ["oxfmt"]
}
```

### Husky hooks

- **`.husky/pre-commit`**: `npx lint-staged`
- **`.husky/pre-push`**: `npm run typecheck && npm run test`

Users need `npm install` once after cloning to activate (the `prepare` script runs husky).

### GitHub Actions — `ci.yml`

Three jobs running on push to any branch and on PRs targeting main:

1. **`check`** — lint + format + typecheck + test + build. Serial, ~1-2 min.
2. **`smoke`** — depends on `check`. Builds, starts prod server, runs HTTP fetch tests against `/:locale/*` URLs. ~1 min.
3. **`vuln`** — parallel with `check`. `npm audit --audit-level=high`. ~30s.

Concurrency group cancels superseded runs on the same branch.

### GitHub Actions — `deploy.yml`

Two jobs gated on event type:

- **`deploy-preview`** — triggers on PR. Uses `wrangler deploy --env preview`. Preview Worker is **single, overwritten per deploy** (name: `igorhasse-preview`). Posts the preview URL as a sticky PR comment.
- **`deploy-prod`** — triggers on push to main. Uses `wrangler deploy`. Binds to routes `igorhasse.com/*` and `www.igorhasse.com/*`.

GitHub Environments:
- `preview` — no protection rules
- `production` — no protection rules (solo dev, auto-deploy on merge)

### GitHub Actions — `dependabot.yml`

Weekly npm updates grouped into a single PR. Monthly GitHub Actions updates. If CI passes, merge.

### `wrangler.jsonc`

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "igorhasse",
  "main": "./dist/server/index.js",
  "compatibility_date": "2026-04-24",
  "compatibility_flags": ["nodejs_compat"],
  "account_id": "<filled in during rollout>",
  "routes": [
    { "pattern": "igorhasse.com/*", "zone_name": "igorhasse.com" },
    { "pattern": "www.igorhasse.com/*", "zone_name": "igorhasse.com" }
  ],
  "assets": {
    "directory": "./dist/client",
    "binding": "ASSETS"
  },
  "observability": { "enabled": true },
  "env": {
    "preview": {
      "name": "igorhasse-preview"
    }
  }
}
```

### Domain strategy

- `www.igorhasse.com` → 301 redirect to apex `igorhasse.com`
- `igorhasse.com/*` → served by the Worker (SSR + static assets)
- Static assets (`/favicon.svg`, `/posts/<slug>/*`, `/assets/*.css`, etc.) served directly from the Workers assets binding — zero Worker CPU cost on these routes

### Free tier fit

Cloudflare Workers Free:
- 100k requests/day
- 10ms CPU per request
- Unlimited static asset serving
- Unlimited bandwidth

Our SSR renders in <5ms. Blog is low-traffic. Fit is comfortable for the foreseeable future.

## Branch protection (main)

GitHub Settings → Branches → Protection rule:

- **Require a pull request before merging** — 0 required approvals (solo dev)
- **Require status checks to pass before merging** — required checks: `check`, `smoke`, `vuln`
- **Do not allow bypassing** — applies to admins too
- **Require conversation resolution before merging** — on
- **Require signed commits** — off (phase 2)
- **Require linear history** — off (merge commits allowed)

Default merge strategy: **squash and merge**.

## Testing guidelines (documentation for future features)

This is the rule that gets included in CLAUDE.md and referenced by the PR template checklist.

### Always write a unit test

Code that can silently break without a higher layer catching it:

1. **Pure functions** in `lib/` — parsers, formatters, slugifiers, reading-time calculator, etc. Input determines output. Zero side effects. Fast to test, high signal.
2. **i18n logic** — middleware locale detection, `getTranslatedSlug`, `normalizeLocale`. Routing decisions are critical.
3. **SEO functions** — sitemap construction, canonical URL building, hreflang alternate maps. Bugs silently destroy search ranking.
4. **External data parsers** — if we integrate webhooks or API responses later, parse logic gets tested.

### Always add a smoke test

Integration points validated after build:

1. **New route** in `app/` → add URL to `tests/smoke.test.ts`.
2. **New XML output** (Atom, different RSS flavor, etc.) → smoke test validates XML parses.
3. **New middleware handler** (redirect rule, auth guard) → smoke test with fixture headers/cookies.

### Skip tests

Code that is cheap to break and cheap to fix visually:

1. **Pure visual React components** with no conditional logic (`SiteFooter`, static eyebrows). The smoke test already catches render failures.
2. **CSS tokens and styles** — not meaningfully testable with a unit-test tool.
3. **Thin wrappers** (`NavLink` only calls `usePathname`) — the test would be larger than the component.
4. **Markdown content** — it's content, not code. Broken frontmatter fails the build naturally.

### Decision rule

Ask: *"If I silently break this logic, will a higher layer catch it?"*

- Yes (build fails, smoke test fails, typecheck complains) → you can skip the unit test.
- No (the bug reaches production and only the user notices) → write the test.

### Layout

- Unit tests co-located with source: `lib/posts.ts` → `lib/posts.test.ts`
- Smoke tests centralized: `tests/smoke.test.ts`
- Fixtures: `tests/fixtures/`

### Coverage threshold

None enforced in phase 1. Coverage is a side effect of following the rule above, not a target. If it drops noticeably, add a threshold in phase 2.

## Secrets & prerequisites (manual, once)

**GitHub repository secrets:**

| Name | Source |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare → My Profile → API Tokens → Create Token (template: "Edit Cloudflare Workers") |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard sidebar → Account ID |
| `VITE_MAILCHIMP_URL` | Mailchimp admin → Audience → Signup forms → Embedded forms → `<form action="...">` |

**GitHub Environments:**
- `preview` (no protection)
- `production` (no protection)

**Cloudflare dashboard (one-time setup):**
1. Add `igorhasse.com` as a site (Free plan)
2. Note the 2 nameservers Cloudflare assigns
3. Change nameservers at the domain registrar
4. Wait for DNS propagation (dashboard shows "Active")
5. Create API Token with "Edit Cloudflare Workers" template
6. Copy Account ID from dashboard sidebar

None of these can be automated — they are in external dashboards under the user's control.

## Rollout order

1. **Fase 1 — Scaffold local** (~1h of code + tests): install devDeps, create configs (`.oxlintrc.json`, `.oxfmtrc.json`, `vitest.config.ts`, `lint-staged` in `package.json`, husky hooks), write unit tests for `lib/posts`, `lib/markdown`, `i18n/strings`, `middleware`, plus `tests/smoke.test.ts`. Run `npm run check` — all green. Commit.

2. **Fase 2 — CI workflows** (~30min): create `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`, `.github/dependabot.yml`, `.github/PULL_REQUEST_TEMPLATE.md`. Push as PR. CI runs but `deploy-preview` fails (no secrets yet — expected).

3. **Fase 3 — Cloudflare setup** (user in dashboards, ~30min-24h depending on DNS): add domain, switch nameservers, wait for Active, create API token, copy Account ID, add 3 GitHub secrets, create GitHub Environments.

4. **Fase 4 — Wrangler + first deploy** (~15min): add `wrangler.jsonc` with real `account_id`, dry-run local, re-push PR — `deploy-preview` passes now. Verify preview URL. Merge to main — `deploy-prod` runs. `igorhasse.com` is live.

5. **Fase 5 — Branch protection** (~5min): configure in GitHub Settings.

6. **Fase 6 — Docs** (~15min): update CLAUDE.md with CI workflow + Testing guidelines summary.

## Verification plan

After Fase 4 the pipeline is fully wired. Manual verification:

1. Typecheck + lint + format + test all pass locally via `npm run check`.
2. Pre-commit hook: touch a `.ts` file, stage, commit — oxlint + oxfmt run automatically. Commit succeeds.
3. Pre-push hook: push — typecheck + test run. Push succeeds.
4. Open a PR: CI jobs `check`, `smoke`, `vuln` all green. `deploy-preview` publishes and bot comments the URL. Open URL — site works.
5. Merge PR: `deploy-prod` runs. `igorhasse.com` returns 200 and shows the merged content.
6. Try `git push origin main` directly: rejected by branch protection.
7. Create a deliberately bad commit (typo in `.ts`): pre-commit fixes format, pre-push catches typecheck error — push blocked.
8. Scan npm audit manually: `npm audit --audit-level=high` — 0 high/critical.

## File inventory

### Created

```
.github/
  workflows/
    ci.yml
    deploy.yml
  dependabot.yml
  PULL_REQUEST_TEMPLATE.md
.husky/
  pre-commit
  pre-push
.oxlintrc.json
.oxfmtrc.json
vitest.config.ts
wrangler.jsonc
tests/
  smoke.test.ts
  fixtures/           (for middleware test fixtures, etc.)
lib/
  posts.test.ts
  markdown.test.ts
i18n/
  strings.test.ts
middleware.test.ts
```

### Modified

```
package.json      # scripts + lint-staged + husky devDep + vitest devDep
CLAUDE.md         # add CI/CD section + Testing guidelines
.gitignore        # if needed for vitest coverage output
```

### No changes

- Application code (`app/`, `components/`, all page/layout files)
- Content (`content/posts/**`)
- Styles (`styles/`)
- `vite.config.ts` (reused by vitest via `defineConfig` import)
- `tsconfig.json`

---

**Next step after user approval:** invoke writing-plans skill to produce step-by-step implementation plan with dependency order, commit checkpoints, and test gates.
