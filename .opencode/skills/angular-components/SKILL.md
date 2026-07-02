---
name: angular-components
description: Angular v22 component rules — standalone, signals, zoneless, binding, projection
---

# Angular Components — v22

## Component Declaration
- Standalone is the default (since v20) — do NOT set `standalone: true`
- One component per file — no barrel re-exports
- File naming: `<feature>.ts` with selector `<feature>`, Angular v22 does not enforce `.component` suffix

## Change Detection
- `ChangeDetectionStrategy.OnPush` is the **default** since v22 — do NOT set it
- The old `Default` is now `ChangeDetectionStrategy.Eager`
- Never call `markForCheck()` or `detectChanges()` manually
- Components re-render automatically when signals they read change

## Inputs and Outputs
```typescript
readonly title = input.required<string>();
readonly count = input(0);
readonly selected = model(false);
readonly itemClicked = output<Item>();
```

## Local State
```typescript
readonly count = signal(0);
readonly doubled = computed(() => this.count() * 2);
```

- Use `effect()` only for side effects (DOM, logging, sync to storage)
- Never use `effect()` to update another signal — use `computed()` instead

## Dependency Injection
```typescript
export class MyComponent {
  private readonly myService = inject(MyService);
}
```

## Template Control Flow
```html
@if (user()) { <p>{{ user()!.name }}</p> }
@for (item of items(); track item.id) { <app-item [data]="item" /> }
@switch (role()) { @case ('admin') { ... } @default { ... } }
```

## Content Projection
- Use `<ng-content>` for single-slot
- Use `<ng-content select="[slot-name]">` for named slots
- Use `NgTemplateOutlet` with `@ContentChild(TemplateRef)` for template context

## Lazy Loading
- Use `@defer` blocks for non-critical sections
- Provide `@placeholder` and `@loading` blocks
- Use `@error` block when content can fail to load
