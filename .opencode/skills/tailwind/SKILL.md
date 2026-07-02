---
name: tailwind
description: Tailwind CSS v4 in Angular v22 — PostCSS, @theme, pnpm, v4 utilities
---

# Tailwind CSS v4 + Angular v22

Current stable version: **v4.3**
Package manager: **pnpm** always.

## Setup
```bash
pnpm add -D tailwindcss @tailwindcss/postcss postcss
```

`.postcssrc.json`:
```json
{ "plugins": { "@tailwindcss/postcss": {} } }
```

`src/styles.css`:
```css
@import "tailwindcss";
```

No `tailwind.config.js` — all config via `@theme {}` in CSS.

## @theme Design Tokens
```css
@theme {
  --color-primary:   oklch(0.55 0.2 250);
  --font-sans:       'Inter', sans-serif;
  --radius-card:     0.75rem;
}
```

## Key v4 Differences from v3
- No `@tailwind base/components/utilities` — just `@import "tailwindcss"`
- No `tailwind.config.js` — use `@theme {}` in CSS
- Opacity modifier: `bg-blue-500/50` not `bg-opacity-50`
- Logical properties: `ms-4` not `ml-4`, `text-start` not `text-left`
- CSS variables in arbitrary values: `bg-(--color-primary)` not `bg-[--color-primary]`
- Container queries: `@container` / `@md:*`
- Custom utilities: `@utility name { ... }`
- Auto-detection of Angular template files — no `content` config needed

## Do NOT
- Install `@tailwindcss/vite` — Angular does not use Vite
- Put `@import "tailwindcss"` in component CSS — global only
- Use `tailwind.config.js` in new projects
- Use `bg-opacity-*` or `text-opacity-*`
- Use `npx` — use `pnpm dlx`
