---
name: jsdoc
description: Minimal JSDoc rules — document exported APIs, not internals
---

# JSDoc Rules

## When to Write
- All exported functions, methods, classes
- Private methods only if logic is non-obvious
- Skip simple getters, one-liners, obvious parameters

## Format
```typescript
/** One-sentence summary ending with a period. */
/**
 * @param paramName - Description.
 * @returns Description.
 */
```

- Describe WHAT and WHY, not HOW
- Don't repeat parameter names in descriptions
- Don't document types — TypeScript carries them
