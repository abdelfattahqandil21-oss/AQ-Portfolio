---
name: typescript
description: TypeScript 6.0 — strict rules, type narrowing, patterns to avoid
---

# TypeScript — v6

- Never `any` — use `unknown` + type guards
- Prefer `type` over `interface` unless declaration merging is needed
- Use `satisfies` to validate objects without widening
- Avoid non-null assertions (`!`) — use optional chaining / explicit checks
- Mark return types on all exported functions
- Use `as const` for immutable literal objects/arrays
- Prefer `readonly` arrays and properties
- Use discriminated unions over optional properties
