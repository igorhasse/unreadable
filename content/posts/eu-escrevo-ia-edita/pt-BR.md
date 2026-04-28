---
title: Eu escrevo, a IA edita
date: 2026-04-28
description: Como otimizei a criação de posts sem perder a voz — a divisão é simples. Eu escrevo, a IA edita, as escolhas continuam sendo minhas.
---

Eu escrevo, a IA edita. Essa é a divisão que fechou pra mim. Quero publicar mais sem que cada post deixe de parecer meu, com meu ritmo, com minhas escolhas, com minha voz.

A IA não escolhe palavra, não escolhe argumento, não escolhe a virada. Cuida do acabamento. Aplica o tom no que eu escrevi com pressa, encaixa no template `.md` do blog antes de eu commitar. Duas skills específicas que rodo no Claude Code.

---

## As Duas Skills

A primeira pega o rascunho cru e devolve no meu tom. Não inventa frase, não troca argumento. Pega o que eu escrevi com pressa e lapida usando padrões que aprendi sobre a minha própria escrita ao longo dos anos:

```yaml
name: personal-voice
purpose: >-
  Convert any text into my writing voice — preserving rhythm, verbatim
  quirks, and the way I actually sound on the page.

removes:
  - AI-slop signature
  - corporate hedging
  - unnecessary qualifiers
  - performative structure

preserves:
  - verbatim patterns from my corpus
  - Portuguese-English code-switching
  - deliberate sentence fragments

output: >-
  Plain markdown. No frontmatter, no bundle, no design system.
```

A segunda pega o output da primeira e encaixa no style-guide `.md` do blog. Title Case nos H2, divisores na hora certa, hierarquia limpa. É o que faltava pra fechar o pipeline. A gente vai do rascunho ao bundle pronto pra commit em fração do tempo:

```yaml
name: editorial-template
purpose: >-
  Turn polished prose into a publishable bundle for the unreadable blog —
  applying editorial discipline so the post reads like it belongs there,
  not like generic markdown dumped into a folder.

enforces:
  - Title Case on every H2
  - "`* * *` dividers paired with each section break"
  - conversational openings, no throat-clearing
  - monospace, bold, italic as the only inline emphasis
  - sparing use of imagery and code blocks

produces:
  - content/posts/<slug>/pt-BR.md # frontmatter + structured body
  - content/posts/<slug>/en.md # placeholder for translation
  - cover.jpg # optional
```

Cheguei nessa divisão depois de tropeçar. Duas vezes, em dois posts que apaguei antes de publicar. Eram a IA escolhendo no meu lugar. A diferença não estava na qualidade do output. Estava em quem decidiu cada palavra.

---

## A Escolha Mais Provável

Tem um ensaio do Ted Chiang no New Yorker — [Why A.I. Isn't Going to Make Art](https://www.newyorker.com/culture/the-weekend-essay/why-ai-isnt-going-to-make-art) — que ficou martelando na minha cabeça. A tese: escrever é fazer escolhas que fogem do óbvio. E o óbvio é exatamente o que a IA, por construção, te entrega — a opção mais provável.

Aí a divisão ficou óbvia. Se a escolha — a palavra, o argumento, a hesitação, a virada — é o que define a voz, então a escolha é justamente o que não dá pra delegar. Todo o resto, dá.

Veredicto: a IA não me empurra mais pro centro estatístico do que um texto "bom" parece. Ela lapida o que sai do meu centro. E o meu centro continua sendo o Igor.

Quem entra aqui, quem assina a newsletter, quer ouvir o Igor. Daqui pra frente cada post sai dessa divisão: eu escrevo, a IA edita. As palavras continuam sendo minhas. O acabamento é compartilhado.
