---
name: documentation
description: JSDoc rules — when to write, structure, what to skip
---

# JSDoc

## When to Write
- All exported functions, methods, classes
- Private methods only if logic is non-obvious
- Skip simple getters / one-liners

## Format
```typescript
/** One-sentence summary. */
/**
 * @param paramName - Description.
 * @returns Description.
 */
```

- Describe WHAT and WHY, not HOW
- Don't repeat param names in descriptions
- Don't document types — TypeScript carries them
