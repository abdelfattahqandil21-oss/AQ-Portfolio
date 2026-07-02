---
name: angular
description: Angular v22 — standalone, zoneless, signals, forms, services, DI, lazy loading, view transitions
---

# Angular v22

Released June 2026. Standalone, zoneless, signal-based by default.

## Core Conventions
- Standalone is default — do NOT set `standalone: true`
- `ChangeDetectionStrategy.OnPush` is the default — do NOT set it. The old Default is now `ChangeDetectionStrategy.Eager`
- Zoneless is the default — do NOT use `provideZonelessChangeDetection()`
- No `@Input/@Output` — use `input()` / `output()` functions
- No `@HostBinding/@HostListener` — use `host` object in `@Component`
- No `@angular/animations` — use `animate.enter` / `animate.leave` (built-in)
- No `ngClass/ngStyle` — use `class` / `style` bindings
- No `*ngIf/*ngFor/*ngSwitch` — use `@if / @for / @switch`
- Always `inject()` — never constructor DI
- `@Service()` = `@Injectable({providedIn: 'root'})` — for singletons
- Bare `@Injectable()` (no providedIn) needs `providers: []` on consumer

## Signals
```typescript
readonly count = signal(0);
readonly doubled = computed(() => this.count() * 2);
// effect() for side effects only — not for signal-to-signal
```

## Async — resource() / httpResource()
```typescript
const data = httpResource<Response>(() => `/api/items?q=${searchTerm()}`);
// .value(), .isLoading(), .error(), .status(), .reload(), .set()

// Chaining
const company = resource({
  params: ({ chain }) => chain(userResource)?.companyId,
  loader: ({ params }) => fetchCompany(params),
});
```

## Lazy Services — injectAsync()
```typescript
const exporter = injectAsync(() => import('./exporter').then(m => m.Exporter));
```

## Lifecycle Hooks
- `afterNextRender` — runs once after next render (for Three.js init, etc.)
- `afterRenderEffect` — reactive effect tied to render cycle
- `afterNextRender` is correct for Three.js canvas init (not `ngOnInit` or `afterRender`)
- `DestroyRef` for cleanup: `this.destroyRef.onDestroy(() => ...)`

## Signal Forms (@angular/forms/signals)
```typescript
import { form, FormField, FormRoot, required, pattern, email } from '@angular/forms/signals';

interface Login { userName: string; password: string; }
readonly m = signal<Login>({ userName: '', password: '' });

readonly f = form(this.m, (p) => {
  required(p.userName, { message: 'required' });
  pattern(p.userName, /^[a-z]+$/, { message: 'pattern' });
}, {
  submission: {
    action: async () => { /* runs when valid */ },
  },
});
```

```html
<form [formRoot]="f">
  <input [formField]="f.userName">
</form>
```

Field: `.value`, `.valid()`, `.invalid()`, `.errors()`, `.touched()`, `.dirty()`, `.disabled()`
Form: `f().submitting()`, `f().reset()`

Validators: `required`, `email`, `min`, `max`, `minLength`, `maxLength`, `pattern`, `validate`, `validateTree`, `validateHttp`, `applyEach`, `applyWhen`

## View Transitions
- Manual only via `ViewTransitionService.start(callback)` — no `withViewTransitions()` on router
- `ApplicationRef.tick()` called inside the callback
- `::view-transition-old/new` MUST be in global CSS (not component styles)

## Three.js Integration
- Dynamic import: `const THREE = await import('three')` — never top-level `import * as THREE`
- Init in `afterNextRender(async () => ...)`
- `RUN_OUTSIDE_ANGULAR` injection token for render loops
- Canvas: `aria-hidden="true"`
