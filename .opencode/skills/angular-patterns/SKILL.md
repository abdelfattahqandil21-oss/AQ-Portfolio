---
name: angular-patterns
description: Angular v22 design patterns — Smart/Dumb, Facade, Repository — when to use them
---

# Angular Design Patterns — v22

## Rules
- `@Service()` for singletons (replaces `@Injectable({providedIn: 'root'})`)
- State: signals only — never RxJS Subject/BehaviorSubject for UI state
- Async data: `resource()` / `httpResource()` instead of manual `toSignal()` patterns

## Smart / Dumb Component Split
**Smart (container):** injects services, owns logic, passes `input()`, listens `output()`
**Dumb (presentational):** receives `input()`, emits `output()` — no service injection

## Facade Pattern
Use when a component coordinates 3+ services. Inject one Facade instead of many services.

## Repository Pattern
Use when data comes from multiple sources (API + cache + localStorage). Skip for pure HTTP services.

## Angular v22 specific
- `resource()` replaces many manual `toSignal()` + loading/error signal patterns
- `injectAsync()` for lazy-loaded services
- `linkedSignal()` for dependent state needing write access
