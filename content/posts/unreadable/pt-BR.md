---
title: "Unreadable: Construído em Par com IA"
date: 2026-04-28
description: Como construí o Unreadable em par com IA. 99/100 no Lighthouse, stack experimental (vinext), pipeline auditável, open source.
---

Construí esse blog com IA. Cada componente, cada pipeline, cada decisão de stack passou pelo loop "eu pergunto, ela propõe, eu critico, a gente itera". E o Lighthouse bate 100 em A11y, Best Practices e SEO em mobile e desktop. Performance fica em 99 no mobile e 100 no desktop.

Tem gente que vai franzir a testa lendo isso. Vibe coding em produção, com stack experimental, deployado em Cloudflare Workers, escrito em par com IA. Cada uma dessas decisões parece arriscada isolada. Junto, soa quase irresponsável.

![Lighthouse mobile + desktop](./lighthouse.png)

Mas a gente tem o resultado. É exatamente a história que esse post conta.

---

## Por Que IA

Eu queria responder uma pergunta concreta. Até onde IA consegue ir num projeto de produção, com qualidade real, métricas mensuráveis, sem hand-waving. Não toy example. Não landing page com Lorem Ipsum. Site de verdade, com SEO real, RSS funcional, OG image dinâmica, deploy automatizado, testes que falham se a gente quebrar algo.

Regra que segui: não aceitar nada sem entender. Se a IA propôs uma solução que eu não consigo defender numa code review, descarta. Se eu não consigo explicar pra mim mesmo POR QUE aquela linha existe, fora.

---

## A Escolha do vinext

Vinext é Vite 8 + React 19 SSR que reimplementa a API do Next.js. Versão 0.0.43 quando a gente começou. Praticamente alpha em zero dot zero alguma coisa.

Não foi pra ser confortável. Foi pra ser showcase.

A tese era: se IA consegue construir um projeto SÉRIO usando uma stack que ela quase não viu no treinamento (vinext praticamente nem aparece nos docs canônicos), então o argumento de "IA só replica padrões que viu" cai. Não cai todo, mas cai bastante.

Spoiler: eu li mais issues do GitHub do que prompts.

---

## Como Foi a Colaboração

Cada decisão importante saiu de um loop conversacional. Dois momentos que ficaram na cabeça.

**O bug do Shiki.** Tentei usar shiki com a engine padrão (oniguruma WASM). Crashou em produção com erro 1101 do Cloudflare. `WebAssembly.instantiate()` de bytes é bloqueado em Workers. A IA propôs `createJavaScriptRegexEngine`. Funcionou de cara. Mas ela não tinha esse conhecimento sozinha. Fui ler os docs do Cloudflare, achei a restrição, voltei pra ela e pedi pra adaptar. Iteração total: 15 minutos. Sem mim, ela ficaria infinitamente debatendo o erro 1101 sem chegar na restrição arquitetural por trás.

**A pipeline de skills.** Em algum momento decidi que queria escrever no meu tom sem que a IA escrevesse por mim. Criamos duas skills: `personal-voice` (converte rascunho cru pra meu tom) e `editorial-template` (estrutura prosa polida em bundle publicável). A primeira tem `voice-profile.md` com citações verbatim do meu corpus. A segunda tem `dan-patterns.md` baseado no overreacted.io. Cada skill com UMA responsabilidade. A IA usa essas skills sempre que escrevo agora, e o resultado fica auditável: comparo o rascunho cru com o output e vejo exatamente o que mudou.

---

## A Stack Inteira

O que tá rodando, linha por linha:

- vinext 0.0.43 — Vite 8 + React 19 SSR com API compat Next.js
- App Router com `[locale]` segment dinâmico
- Tailwind v4 com tokens em `styles/tokens.css`
- marked + shiki pra markdown (engine JS, não WASM)
- `next/og` pra OG images dinâmicas
- oxlint + oxfmt (Rust-based, ~50× mais rápido que ESLint/Prettier)
- vitest unit + smoke
- husky + lint-staged pre-commit/pre-push
- GitHub Actions CI
- Cloudflare Workers deploy
- Yarn 4 (Berry) com Corepack

Praticamente tudo no estado-da-arte. E praticamente tudo recente. vinext na 0.0.43, Vite 8 (lançado faz pouco), Tailwind v4 (alpha de pouco tempo), oxlint/oxfmt (Rust tooling que está emergindo).

---

## CI / CD / Testes

Três portões entre editar e servir.

**Local (husky):**

- pre-commit: `oxlint --fix` + `oxfmt` em staged files
- pre-push: `yarn check` (lint + format + typecheck + tests)

**CI (`.github/workflows/ci.yml`):**

- check: lint, format, typecheck, test --coverage, build
- smoke: builds, sobe `vinext start`, roda HTTP tests em todas as rotas
- vuln: `yarn npm audit --severity high`

**Deploy (`.github/workflows/deploy.yml`):**

- Roda só em push pra main
- `npx vinext deploy` → `vite build` + `wrangler deploy`
- Environment "production" pede approval click antes de rodar

Toda PR roda os 3 jobs paralelos. main tem branch protection exigindo verde antes de merge. Dependabot manda PR semanal agrupada de updates npm e mensal de GitHub Actions.

Total: nada chega em produção sem passar por automação.

---

## As Métricas

![Lighthouse mobile + desktop](./metrics.png)

| Métrica        | Home M | Home D | Post M | Post D |
| -------------- | ------ | ------ | ------ | ------ |
| Performance    | 99     | 100    | 99     | 100    |
| Accessibility  | 100    | 100    | 100    | 100    |
| Best Practices | 100    | 100    | 100    | 100    |
| SEO            | 100    | 100    | 100    | 100    |
| LCP            | 1.7s   | 0.1s   | 1.8s   | 0.5s   |
| CLS            | 0.001  | 0      | 0.017  | 0      |
| TBT            | 0ms    | 0ms    | 0ms    | 0ms    |
| FCP            | 1.7s   | 0.1s   | 1.8s   | 0.3s   |

Mobile tem 1 ponto de margem que é medição. Aceito.

Como cada métrica saiu desses números:

- **Performance.** Fontes self-hostadas (JetBrains Mono, Newsreader, Geist), CSS crítico inline no SSR, vinext bundle minificado per environment. CLS começou alto por FOUT do font swap. Resolveu com `font-display: swap` + fallback metrics. LCP começou em 3.5s. Resolveu self-hostando JetBrains Mono inline no `CRITICAL_CSS` do layout.
- **A11y.** Color contrast WCAG AA via tokens, semantic HTML, aria labels onde precisa.
- **SEO.** Gerei `sitemap.xml` dinamicamente via `app/sitemap.ts`, `robots.txt` via `app/robots.ts`, hreflang + canonical no metadata de cada rota, structured data (`BlogPosting` JSON-LD), OG images dinâmicas via `next/og`.

---

## Pegadinhas do vinext

Stack experimental cobra preço. Os principais que a gente tropeçou:

- `next/font/google` é runtime CDN load. Não self-hospeda como no Next.js real. Pra fonte que precisa estar inline no critical CSS, tem que self-hostar manualmente.
- `next/og` só funciona em prod. Satori native modules crash Vite RSC dev. Tem que `vinext build && vinext start` pra testar OG images.
- `WebAssembly.instantiate()` de bytes é bloqueado em Workers. Shiki default crash com erro 1101. Solução: `createJavaScriptRegexEngine`.
- Vite NÃO minifica SSR/Worker bundles por default. Tem que setar `build.minify: "esbuild"` per environment. Sem isso, ~40% mais JS no Worker.
- Use `vinext deploy`, NÃO `wrangler deploy` raw. Sem o vinext deploy, vite-plugin-cloudflare não wire-up o `main` do Worker. Resultado: assets-only deploy que 404 em rotas dinâmicas.
- `opengraph-image.tsx` não é auto-linkado no metadata. Diferente do Next.js, vinext não injeta automaticamente. Precisa setar `openGraph.images` explícito em cada `generateMetadata`.
- Ambient `next` types não estão automatically resolvable. vinext não instala `next`, então alguns type imports do `"next"` precisam de declarações em `next-env.d.ts`.

Cada uma dessas pegadinhas custou de 30 minutos a 2 horas pra resolver. A maioria não tá nos docs do vinext. Tive que ler issues do GitHub, code da própria lib, às vezes só descobrir testando.

---

## Open Source

Repo em [github.com/igorhasse/unreadable](https://github.com/igorhasse/unreadable) sob MIT.

Forka, troca `lib/site-config.ts` pra tua identidade, e roda teu próprio blog na mesma stack.

Mas considera os caveats. vinext é 0.0.43. Pode quebrar entre versões. A documentação ainda tá rasa. A galera ativamente usando é pequena. Tem features que pareciam funcionar e não funcionavam (`next/og` em dev, `og:image` no meta), tem decisões arquiteturais que mudam ainda (Next.js 16 renomeou `middleware` pra `proxy`, vinext acompanhou).

Se você precisa de produção HOJE, com SLA, com time grande, com estabilidade comprovada, vai de Next.js. Se você quer experimentar com edge runtime + Vite + React 19 SSR num projeto pessoal ou MVP, vinext é uma escolha defensável. Mas com olho aberto. A IA me ajudou a navegar essa imaturidade. Cada gotcha virou conhecimento documentado. Cada solução foi auditável. Esse post é parte dessa documentação.

Como sempre.
