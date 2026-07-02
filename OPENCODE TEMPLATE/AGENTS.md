# Project rules

## Stack
<!-- FILL: e.g. Angular 22 + Tailwind v4.3 + TypeScript 6.0 strict -->

## Package manager
pnpm only. Never npm or yarn.

## Folder structure
<!-- FILL: paste your src/ tree here -->

## Hard rules
- No `any` — use `unknown` and narrow
- No barrel `index.ts` files
- No class-based state — signals only
- No inline styles — Tailwind classes only
- Commit message format: `type(scope): message` — types: feat/fix/refactor/chore/docs
- Always `inject()` — never constructor DI
- Always `input()/output()` — never `@Input/@Output`

## Do not re-discuss
<!-- FILL: decisions already made that the agent should not question -->
