---
title: I Write, AI Edits
date: 2026-04-28
description: How I sped up post creation without losing my voice — the split is simple, I write, AI edits, the choices stay mine throughout.
---

I write, AI edits. That's the split that works for me. I want to publish more without each post losing what makes it mine — my rhythm, my choices, my voice.

AI doesn't pick the word, doesn't pick the argument, doesn't pick the turn. It handles the finish. Applies the tone to what I wrote in a rush, slots it into the blog's `.md` template before I commit. Two specific skills I run in Claude Code.

---

## The Two Skills

The first takes the raw draft and gives it back in my tone. Doesn't invent sentences, doesn't swap arguments. Takes what I wrote in a rush and polishes it using patterns I've learned about my own writing over the years:

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

The second takes the output of the first and slots it into the blog's `.md` style guide. Title Case on H2s, dividers at the right spot, clean hierarchy. It's what was missing to close the pipeline. We go from draft to commit-ready bundle in a fraction of the time:

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

I landed on this split after tripping. Twice, on two posts I deleted before publishing. Both were AI choosing in my place. The difference wasn't output quality. It was who decided each word.

---

## The Most Likely Choice

Ted Chiang published an essay in The New Yorker called [Why A.I. Isn't Going to Make Art](https://www.newyorker.com/culture/the-weekend-essay/why-ai-isnt-going-to-make-art) that stuck with me. Writing, he says, is making choices that aren't the default. AI, by construction, hands you the most likely one.

Then it clicked which split was right. If the choice (the word, the argument, the hesitation, the turn) is what defines voice, then the choice is exactly what CAN'T be delegated. Everything else can.

Verdict: AI doesn't push me toward the statistical center of what a "good" text looks like anymore. It polishes what comes from me. And what comes from me is still Igor.

Whoever lands here, whoever subscribes to the newsletter, wants to hear Igor. From here on, every post comes out of this split: I write, AI edits. The words stay mine. The finish is shared.
