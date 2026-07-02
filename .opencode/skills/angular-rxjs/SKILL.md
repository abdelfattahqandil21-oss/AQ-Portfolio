---
name: angular-rxjs
description: Angular v22 RxJS interop — toSignal, toObservable, resource() as replacement, takeUntilDestroyed
---

# RxJS in Angular v22

## Signals Over RxJS for UI State
- Use signals for component/service state — not `Subject` or `BehaviorSubject`
- Use `resource()` / `httpResource()` for async data fetching (replaces many RxJS patterns)

## When to Keep RxJS
- WebSocket streams
- Complex operator pipelines (debounce, switchMap, combineLatest)
- Third-party libraries that emit observables

## Interop
```typescript
readonly data = toSignal(this.data$, { initialValue: null });
readonly query$ = toObservable(this.query);
```

## Subscription Cleanup
```typescript
this.data$.pipe(takeUntilDestroyed()).subscribe(...)
```

## HttpResource (preferred over HttpClient + toSignal)
```typescript
const data = httpResource<Response>(() => `/api/items?q=${searchTerm()}`);
```

## Chaining resources
```typescript
const companyResource = resource({
  params: ({ chain }) => chain(userResource)?.companyId,
  loader: ({ params }) => fetchCompany(params),
});
```
