---
title: Getting Started with React
date: 2026-03-20
description: A beginner's guide to building user interfaces with React, covering components, state, and hooks.
---

# Getting Started with React

React is a JavaScript library for building user interfaces. In this post, we'll cover the basics of React and how to get started.

## Components

Components are the building blocks of React applications. They let you split the UI into independent, reusable pieces.

```tsx
function Welcome({ name }: { name: string }) {
  return <h1>Hello, {name}</h1>;
}
```

## State and Hooks

React hooks let you use state and other React features in function components.

```tsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
}
```

Happy coding!
