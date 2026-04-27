---
title: "Quem Tá Fazendo o Trabalho? LLMs e Harnesses em 2026"
date: 2026-04-25
description: "Quem tá fazendo o trabalho quando o Cursor edita um arquivo: o modelo ou o editor? Spoiler: na maior parte do que parece inteligência, não é o modelo."
draft: true
---

Todo dia a gente abre o Cursor, escreve "conserta esse bug", e o arquivo certo aparece editado. Tudo certo, segue o jogo.

Aí vem a pergunta chata: quem tá fazendo o trabalho ali? O modelo (Claude, GPT) ou o editor (Cursor)?

Spoiler: na maior parte do que a gente sente como "inteligência" hoje, não é o modelo.

---

## O Que um LLM É, de Verdade

Um LLM é uma função. Texto entra, texto sai. Stateless. Sem memória. Sem mãos. Um preditor do próximo token treinado em três atos:

1.  Pré-treino. Prever próximo token em trilhões de palavras. Internet, livros, GitHub, papers. É onde mora o conhecimento bruto.
2.  Pós-treino (RLHF / RLAIF). Humanos e IA ensinam o que é útil, seguro, e como usar ferramentas. Vira assistente.
3.  Deploy. Pesos congelados. O modelo que você usa é um arquivo estático. Não aprende mais com você. Um `.bin` gigante.

Quando parece que ele "lembra" de você, é o harness guardando contexto. Não é o modelo.

E tem uma lista do que o modelo, sozinho, NÃO faz: não lê arquivos do projeto, não roda comandos, não acessa internet, não lembra da conversa de ontem, não sabe a hora atual, não executa nada. Só gera texto. Literalmente.

Então fica a pergunta óbvia: como é que o Cursor editou aquele arquivo pra você ontem?

---

## O Dado que Choca

Em doze meses, tudo mudou. Em 2025, ~25% do código aceito em PRs era gerado por IA. Em 2026, em muitas empresas passou de 70-80%. A Anthropic reporta que 90%+ do código do Claude Code é escrito pelo próprio Claude Code.

Esse salto tem uma explicação preguiçosa que aparece em todo lugar: "ah, o modelo ficou mais inteligente". Falso.

---

## A Parede que os Modelos Bateram

O modelo, isolado, não podia entregar esse salto. Ele bateu em quatro paredes ao mesmo tempo:

```text
Parede de energia    Microsoft religa Three Mile Island em 2028. Amazon, Meta, Google
                     correndo atrás de nuclear. Treino esbarrando em grid físico.

Parede de custo      GPT-4: ~US$ 100M de treino. GPT-5: estimado US$ 500M-1B.
                     Cada salto custa 5-10x mais pra ganho marginal.

Parede matemática    Attention é O(n²). Dobrar o contexto = 4x compute.
                     "Contexto de trilhão" é inviável com essa arquitetura.

Parede de dados      Internet pública de qualidade basicamente exaurida.
                     Labs hoje operam majoritariamente com dados sintéticos.
```

Quatro paredes simultâneas. Não dá pra resolver isso comprando mais GPU. Então se o modelo não podia ser a resposta sozinho, o que mudou de 2025 pra 2026?

---

## Os Três Vetores

A resposta honesta tem três vetores, não um.

1.  Os modelos melhoraram. Claude 4.x, GPT-5, contexto de 1M tokens, thinking modes, tool use nativo melhor. É real. Mas é incremental.
2.  Os harnesses amadureceram. Agentic loops saíram da demo e viraram produto. O Cursor que a gente usa hoje é outro produto comparado ao Cursor de 2024.
3.  A economia viabilizou. Prompt caching com 90% de desconto em tokens repetidos tornou viável um agente fazer 50 tool calls numa task sem queimar o orçamento.

~70% do salto real mora no vetor #2. Aqui mudou tudo.

---

## O Que É um Harness

Harness é tudo que envolve o modelo pra transformar texto → texto em agente que age no código. Cursor, Claude Code, Codex, Windsurf, Cline, Aider, Devin. Sete produtos diferentes que podem usar o MESMO modelo por baixo. A diferença entre eles é 100% harness.

A anatomia, usando o Cursor de exemplo:

```text
System Prompt    →  regras do Cursor
Tools            →  Read / Edit / Terminal
Agentic Loop     →  Agent mode
Context Mgmt     →  @-mentions, indexing
Memory           →  .cursorrules, Rules
Permissions      →  auto-run settings
Sub-agents       →  background agents
              ↓
         LLM (Claude / GPT)
```

Sete camadas. O modelo é UMA delas, lá no fundo.

---

## O Segredo que Ninguém te Conta

A maior parte da inteligência que você sente no Cursor não vem do modelo. Vem de engenharia de contexto.

Quando você digita "conserta esse bug", o Cursor não manda o repo inteiro pro modelo (caro, lento, e estoura o context window). Ele usa índice vetorial pra achar os arquivos relevantes, injeta o `.cursorrules` do projeto, dá ferramentas de grep/read/edit pro modelo procurar mais por conta própria, compacta a conversa antiga, e só aí monta o prompt final. O harness fez 80% do trabalho de pensamento ANTES do modelo abrir a boca.

Tradução prática: trocar Claude por GPT-5 no mesmo Cursor muda menos do que parece. Trocar Cursor por outro harness com o MESMO Claude muda muito mais.

---

## MCP, Plugins, Skills

Aí entra o ecossistema que cresceu em volta. MCP (Model Context Protocol) é o padrão aberto que permite qualquer ferramenta virar tool de qualquer LLM. GitHub, Jira, Slack, Datadog, todos viram cliente do mesmo barramento. Antes era N×M de trabalho, cada harness com integração proprietária. Agora um servidor MCP funciona em qualquer cliente.

Plugins são código curado rodando dentro do próprio harness, com integração profunda com o editor. Cursor tem Custom Commands e extensões. Claude Code tem plugins próprios (esse deck mesmo saiu de um plugin).

Skills são workflows empacotados carregados sob demanda. A descrição curta fica "esperando", o corpo completo só entra no contexto quando bate. Lazy-loading de expertise. Coisas como "review PR", "security audit", "deploy".

---

## Quando Usar o Quê (e o Custo de Cada Um)

A regra de bolso por cenário:

```text
Sistema externo (Jira, DB, Slack)        →  MCP
Workflow repetitivo do time              →  Skill
Feature do editor / atalho rápido        →  Plugin
Task pontual                             →  Só peça
```

Mas a parte que dói no bolso é o custo em tokens. Mesma função, "criar PR", em três formatos:

```text
MCP GitHub (30 tools)        ~10.000 tokens só pra declarar
Plugin com 3 comandos          ~500 tokens
Skill "criar-pr"                ~30 tokens (descrição lazy)
```

Se existe plugin ou skill pra mesma coisa que um MCP faz, é 10-30x mais barato. MCP declara TUDO upfront, todas as ferramentas, sempre. Plugin expõe só quando invocado. Skill nem isso, só a descrição. Multiplique por toda task que a gente roda no dia, e a economia é grosseira.

---

## As Alavancas que o Cursor Entrega de Graça

Esse é o ponto onde o desenvolvedor vira diretor do harness. O Cursor (e a maioria dos concorrentes sérios) expõe pra você configurar:

`.cursorrules` é memória persistente por projeto, versionada no repo. É a primeira coisa que a gente precisa ESCREVER, e quase ninguém escreve. User Rules são preferências globais que aplicam em todos os projetos seus. Notepads são contextos reutilizáveis que você injeta com um click. `@docs` indexa documentação externa e vira referência viva do agente. MCP Servers conectam sistemas externos (use com parcimônia, lembra do custo). Custom Commands são slash commands próprios, workflow do time em um atalho.

Pergunta que eu faço em todo time: quem aqui tem `.cursorrules` no repo principal? Quase nunca tem mão levantada.

---

## Voltando à Pergunta Inicial

Então, quem tá fazendo o trabalho?

O modelo é o motor. Claude, GPT, gera a intenção, o texto, o plano. O harness é as mãos. Cursor transforma intenção em ação no mundo real, lê arquivos, edita, roda comando, persiste memória. E você é o diretor: define o quê, configura o como, julga o resultado.

Na próxima vez que o Cursor errar, antes de culpar o modelo, pergunta: o que ele tava vendo? Que regra tava ativa? Que ferramenta ele tinha em mãos? Em um ou dois anos a gente deve estar olhando pra esse deck e achando primitiva a forma como a gente configura tudo isso. Como sempre.
