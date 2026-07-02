---
name: typescript
description: TypeScript 6.0 strict mode rules for this project
---

# TypeScript — v6

- Never use `any` — use `unknown` and narrow with type guards
- Prefer `type` over `interface` unless declaration merging is needed
- Use `satisfies` operator to validate objects against a type without widening
- Avoid non-null assertions (`!`) — use optional chaining or explicit checks
- Mark function return types for all exported functions
- Use `as const` for literal objects and arrays that should not be mutated
- Prefer `readonly` arrays and properties
- Use discriminated unions over optional properties for state modeling
