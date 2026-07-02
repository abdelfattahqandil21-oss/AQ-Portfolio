---
name: css
description: Tailwind CSS v4 in Angular v22 — @theme, PostCSS, v4 utilities, pnpm setup
---

# Tailwind CSS v4

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
  --color-surface:   oklch(0.12 0.008 260);
  --font-sans:       'Inter', sans-serif;
  --radius-card:     0.75rem;
}
```

## Key v4 Changes
| v3 (wrong) | v4 (correct) |
|---|---|
| `@tailwind base;` | `@import "tailwindcss"` |
| `tailwind.config.js` | `@theme {}` in CSS |
| `bg-opacity-50` | `bg-blue-500/50` |
| `ml-4 mr-4` | `ms-4 me-4` |
| `text-left` | `text-start` |
| `bg-[--var]` | `bg-(--var)` |
| `grid-cols-[1fr,2fr]` | `grid-cols-[1fr_2fr]` |

## Do NOT
- Install `@tailwindcss/vite` — Angular doesn't use Vite
- Put `@import "tailwindcss"` in component CSS — global only
- Use `tailwind.config.js` in new projects
- Use `ng add @tailwindcss/schematics` — not needed in v4
- Use `npx` — use `pnpm dlx`
