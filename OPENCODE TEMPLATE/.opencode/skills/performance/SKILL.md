---
name: performance
description: Angular v22 performance — signals, lazy loading, @defer, bundle budgets
---

# Performance

## Signals over RxJS for UI
Signals are synchronous and fine-grained — Angular re-evaluates only changed expressions.

## Lazy Routes
Every feature route must be `loadComponent` or `loadChildren`.

## @defer
```html
@defer (on viewport) { <app-heavy /> }
@placeholder { <div class="h-64 animate-pulse"></div> }
```

## track in @for
```html
@for (item of items(); track item.id) { ... }
```

## Avoid
- Function calls in templates — use `computed()`
- `ngSrc` for images (NgOptimizedImage)
- Heavy third-party in main bundle — lazy load
