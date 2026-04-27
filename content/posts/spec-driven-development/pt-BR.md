---
title: "Spec-Driven Development: Moda, Método, ou Armadilha?"
date: 2026-04-25
description: Preparei uma tech talk sobre Spec-Driven Development e fui obrigado a responder em voz alta: isso é método, moda, ou armadilha?
draft: true
---

Em abril de 2026 preparei uma tech talk sobre Spec-Driven Development (SDD) e fui obrigado a responder em voz alta uma pergunta que vinha adiando há meses: isso é método, moda, ou armadilha?

Antes de tentar responder, um diagnóstico do chão de fábrica. Quem nunca viu a IA criar uma classe que já existia no repositório, ignorar uma convenção estabelecida do projeto, ou "entender" o requisito e entregar outra coisa, levanta a mão. Eu trabalho como Senior Frontend Developer e nos últimos dois anos vi os três acontecerem na mesma sprint mais de uma vez. Vibe coding tá quebrando, e quebra de quatro formas que repetem com previsibilidade desconfortável.

## Como o Vibe Coding Quebra

Primeira: review fatigue. Dev virou revisor de PR em loop infinito. Antes a gente escrevia umas 200 linhas no dia, hoje a gente revisa 2.000. Segunda: alucinação cumulativa. Erro num prompt vira bug, bug aceito vira padrão, padrão se propaga nas próximas gerações de código. Terceira: context drift. A IA "esquece" convenções a cada nova sessão, e a gente repete a mesma regra cinco vezes na mesma semana. Quarta: falsa produtividade. Velocity sobe, estabilidade cai. Entrega ~3× mais rápida, retrabalho ~2× maior. No fim do trimestre o saldo é zero, com bônus de cansaço.

---

## De Prompt Para Spec

A realização que me empurrou pra SDD foi banal. Quando a gente escreve um prompt com contexto, exemplos, restrições e casos de borda, isso já é SDD. Versão amadora, não-versionada, descartada no fim da conversa. SDD tá pra prompt como TDD tá pra "vou testar depois". Mesma coisa, com disciplina. A pergunta deixa de ser "vale formalizar?" e vira "formalizar com que custo?".

A definição que mais me serviu vem do Tessl Framework: _"Specs describe intent in a structured, testable language, and agents generate code to match."_ Spec descreve intenção em linguagem estruturada e testável, agente gera código pra corresponder. Tradução prática: a gente para de mandar prompt e começa a manter um artefato.

Existem três níveis de ambição, em ordem crescente de custo. Spec-first: escreve spec, gera código, descarta a spec. Tímido, barato, perde benefício a longo prazo. Spec-anchored: spec vive junto com o código, muda código atualiza spec, muda spec regenera. É onde mora a prática real. Spec-as-source: você só edita a spec, o código é auto-gerado e marcado como não-editável. O sonho. E a maior polêmica.

---

## As Três Ferramentas na Prática

Pra dar nome aos bois, três ferramentas hoje cobrem esses três níveis. Vou na ordem de menor pra maior cerimônia.

Kiro é a porta de entrada. Três markdowns (`requirements.md`, `design.md`, `tasks.md`), VS Code, pronto. Memória do projeto vive em arquivos de "steering" (`product.md`, `tech.md`, `structure.md`) lado a lado com o código. Iniciante-friendly. Bom pra primeiro contato sem comprometer workflow. Kiro é GA hoje, e é o que eu uso quando quero experimentar SDD num feature novo sem quebrar o resto da equipe.

Spec-kit é o pacote do GitHub, CLI, GA. O mais robusto, e o mais tedioso. Workflow de quatro etapas: `Constitution` (regras imutáveis do projeto, tipo TypeScript strict, testes obrigatórios, nunca hardcode keys), `/specify`, `/plan`, `/tasks`. Branch por spec, markdowns pra revisar, checkpoint entre cada etapa. Enterprise, checklistado. Vale pra feature grande, overkill em bug.

Tessl é a aposta radical. Spec-as-source, private beta em 2025. A premissa é que a gente não edita código, edita spec. O código sai com `// GENERATED FROM SPEC — DO NOT EDIT` no topo, e tags `@generate` e `@test` dentro da própria spec direcionam o que sai onde. Vale acompanhar. Não vale depender.

Comparando as três rapidamente: Kiro tem curva baixa, overhead baixo, controle médio, é GA, serve pra experimentar. Spec-kit tem curva média, overhead alto, controle alto, é GA, serve pra time sério em feature pesada. Tessl tem curva alta, overhead alto, controle altíssimo, é beta, serve pra early adopter que aceita pagar o preço.

---

## O Aviso da Birgitta

Aí vem a parte que mais me marcou na pesquisa pra essa talk. Birgitta Böckeler, da Thoughtworks, publicou no _Exploring Gen AI · Oct 2025_ um relato de Spec-kit rodando em repo legado. Mesmo com toda a cerimônia (`Constitution`, `/specify`, `/plan`, `/tasks`), o agente re-gerou classes que já existiam, ignorou a documentação do próprio código, criou duplicatas silenciosas. Mais arquivos de processo não foi proporcional a menos alucinação. Mudou o tipo de erro, não a frequência.

Essa frase ficou comigo: muitos arquivos não é proporcional a menos alucinação. Às vezes só muda o tipo de erro.

---

## O Fantasma do MDD

Tem um paralelo histórico que ninguém na sala da talk gostou de ouvir: Model-Driven Development dos anos 2000. Input era modelo visual em UML, motor era parser determinístico, e a coisa morreu por overhead e rigidez. Em SDD a gente trocou modelo visual por spec textual em linguagem natural, e parser determinístico por LLM probabilístico. Ganhamos linguagem natural. Perdemos validação automática. Compensa? Honestamente, não sei cravar. É a pergunta que continua aberta.

---

## Quando Usar e Quando Deixar na Bancada

Veredicto pra quem precisa decidir hoje. Use SDD em feature grande multi-arquivo, domínio complexo com regras densas, código crítico (auth, pagamento, compliance), time que vai manter por meses, ou quando rastreabilidade é requisito de verdade. Não use SDD em bug de três linhas, protótipo descartável, script one-shot, POC de fim de semana, ou quando velocidade pesa mais que rigor.

Regra que sigo: se a spec demora mais que o código, algo tá errado. Ou a feature era pequena demais pra esse cinto, ou a spec virou cerimônia performativa.

Fechando com a frase que a Birgitta usou no fim do post dela, que é também a frase que eu coloquei no último slide da talk: _"Are we really improving something, or are we getting worse trying to improve?"_ A gente tá realmente melhorando algo, ou piorando na tentativa de melhorar? Eu não tenho a resposta cravada. Tenho a postura: SDD entra na caixa de ferramenta, não no cinto. Puxa quando o problema pede, deixa na bancada quando não pede. O LEITOR PRIMÁRIO do código hoje é o agente, e a gente tá aprendendo a escrever pra ele em tempo real. Em um ou dois anos a gente deve estar olhando pra esse post e achando primitivo o que acabei de mostrar. Como sempre.
