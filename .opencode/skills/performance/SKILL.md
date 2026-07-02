---
name: performance
description: Angular v22 performance — zoneless, signals, lazy loading, bundle analysis
---

# Performance — v22

## Signals Over RxJS for UI State
Signals are synchronous and fine-grained — Angular knows exactly which expressions to re-evaluate.

## Lazy Routes
Every feature route must be lazy-loaded via `loadComponent` or `loadChildren`.

## @defer for Heavy Content
```html
@defer (on viewport) { <app-heavy-chart /> }
@placeholder { <div class="h-64 animate-pulse"></div> }
```

## Track in @for
```html
@for (item of items(); track item.id) { ... }
```

## Images
- Use `NgOptimizedImage` (`ngSrc`)

## Bundle Analysis
```bash
pnpm run build
# Check chunk sizes in the output
```
