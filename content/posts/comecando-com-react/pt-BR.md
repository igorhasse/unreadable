---
title: Começando com React
date: 2026-03-20
description: Um guia iniciante pra construir interfaces com React, cobrindo componentes, estado e hooks.
---

# Começando com React

React é uma biblioteca JavaScript pra construir interfaces de usuário. Neste post, vamos cobrir o básico do React e como começar.

## Componentes

Componentes são os blocos de construção de aplicações React. Eles permitem dividir a UI em pedaços independentes e reutilizáveis.

```tsx
function Welcome({ name }: { name: string }) {
  return <h1>Olá, {name}</h1>;
}
```

## Estado e hooks

Os hooks do React deixam você usar estado e outros recursos em componentes de função.

```tsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>Contagem: {count}</button>;
}
```

Bom código!
