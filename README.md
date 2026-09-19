# React + TypeScript + Vite + shadcn/ui

This is a template for a new Vite project with React, TypeScript, and shadcn/ui.

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `src/components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button"
```

## Project structure

See [AGENTS.md](./AGENTS.md) for the current architecture: each route gets its own folder under `src/pages/<page>/` holding its page component and that page's own section components, generic shadcn primitives live in `src/components/ui/`, and shared chrome (`NavBar`, `Footer`, `theme-provider`) lives directly under `src/components/`.
