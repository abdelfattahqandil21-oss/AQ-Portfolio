# Angular v22 Complete Developer Guide

> Production-ready reference for building modern Angular applications.

---

## 1. Core Conventions

```ts
// ❌ WRONG - not needed
@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OldComponent {}

// ✅ CORRECT - standalone & OnPush are defaults in v22
@Component({
  selector: 'app-modern',
  template: `<p>Hello</p>`,
})
export class ModernComponent {}

// ✅ Zoneless is the default — no provider needed
// Zoneless is enabled by default since Angular v21+.
// Only add provideZonelessChangeDetection() if targeting v20.
export const appConfig: ApplicationConfig = {
  providers: [],
};
```

### Key Rules
| Rule | ✅ Do | ❌ Don't |
|------|-------|----------|
| Standalone | Omit `standalone: true` | Add it explicitly |
| Change Detection | Omit — OnPush is default | Set `OnPush` manually |
| Host bindings | `host: { class: 'foo' }` | `@HostBinding` / `@HostListener` |
| Input/Output | `input()`, `output()` functions | `@Input()`, `@Output()` decorators |
| DI | `inject()` function | Constructor injection |
| Static images | `NgOptimizedImage` directive | Plain `<img>` |
| ngClass / ngStyle | `[class]` / `[style]` bindings | `ngClass` / `ngStyle` |
| Control flow | `@if`, `@for`, `@switch` | `*ngIf`, `*ngFor`, `*ngSwitch` |
| Signals mutation | `.set()` / `.update()` | `.mutate()` |

---

## 2. @Service() Decorator

Replaces `@Injectable({providedIn: 'root'})` for singleton services.

```ts
import { Service } from '@angular/core';

@Service()
export class DataStore {
  private items = signal<string[]>([]);

  readonly itemsCount = computed(() => this.items().length);

  add(item: string) {
    this.items.update(list => [...list, item]);
  }
}
```

Keep `@Injectable()` only when you need:
- Non-root providers (`providedIn: 'platform'`, `providedIn: 'any'`)
- Constructor injection (rarely needed)
- InjectionToken configuration

---

## 3. Signal Forms (`@angular/forms/signals`)

### 3.1 Setup
```ts
import { Component, signal } from '@angular/core';
import { form, FormField, FormRoot, required, email, minLength, pattern } from '@angular/forms/signals';
```

### 3.2 Basic Form

```ts
interface LoginData {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  imports: [FormField, FormRoot],
  template: `
    <form [formRoot]="f">
      <input [formField]="f.email" type="email" placeholder="Email" />

      @if (f.email().touched() && f.email().invalid()) {
        @for (err of f.email().errors(); track err.kind) {
          <p>{{ err.message }}</p>
        }
      }

      <input [formField]="f.password" type="password" placeholder="Password" />

      @if (f.password().touched() && f.password().invalid()) {
        @for (err of f.password().errors(); track err.kind) {
          <p>{{ err.message }}</p>
        }
      }

      <button type="submit" [disabled]="f().submitting()">
        @if (f().submitting()) { Loading... } @else { Login }
      </button>
    </form>
  `,
})
export class LoginForm {
  readonly model = signal<LoginData>({ email: '', password: '' });

  readonly f = form(this.model, (p) => {
    required(p.email, { message: 'Email is required' });
    email(p.email, { message: 'Enter a valid email' });
    required(p.password, { message: 'Password is required' });
    minLength(p.password, 8, { message: 'Min 8 characters' });
  });
}
```

### 3.3 Form Submission

```ts
readonly f = form(this.model, (p) => {
  required(p.email);
  required(p.password);
}, {
  submission: {
    action: async () => {
      await this.authService.login(this.model());
    },
    onInvalid: (field) => {
      const first = field().errorSummary()[0];
      first?.fieldTree().focusBoundControl();
    },
    ignoreValidators: 'pending', // default: submit even if async validators pending
  },
});
```

### 3.4 Field State Reference

| Signal | Description |
|--------|-------------|
| `f.email().value` | WritableSignal of field value |
| `f.email().valid()` | No validation errors |
| `f.email().invalid()` | Has validation errors |
| `f.email().errors()` | Array of `{kind, message}` objects |
| `f.email().pending()` | Async validation in progress |
| `f.email().touched()` | Field was focused then blurred |
| `f.email().dirty()` | User modified the field |
| `f.email().disabled()` | Field is disabled |
| `f.email().hidden()` | Field should be hidden |
| `f.email().readonly()` | Field is readonly |
| `f().submitting()` | Form is being submitted |
| `f().errorSummary()` | All errors for focus management |
| `f().valid()` / `f().invalid()` | Root form validity |

### 3.5 All Validators

```ts
import {
  required, email, min, max, minLength, maxLength, pattern,
  validate, validateTree, validateHttp,
  applyEach, applyWhen, applyWhenValue,
  disabled, hidden, readonly,
} from '@angular/forms/signals';

// --- Built-in ---
required(p.name, { message: 'Required' });
email(p.email, { message: 'Invalid email' });
min(p.age, 18, { message: 'Must be 18+' });
max(p.age, 120, { message: 'Invalid age' });
minLength(p.password, 8, { message: 'Too short' });
maxLength(p.bio, 500, { message: 'Too long' });
pattern(p.phone, /^\d{10}$/, { message: '10 digits required' });

// --- Conditional required ---
required(p.promoCode, {
  message: 'Required',
  when: ({ valueOf }) => valueOf(p.applyDiscount),
});

// --- Custom validator ---
validate(p.username, ({ value, valueOf }) => {
  if (value().length < 3) {
    return { kind: 'tooShort', message: 'Min 3 characters' };
  }
  return null;
});

// --- Cross-field validator ---
validate(p.confirmPassword, ({ value, valueOf }) => {
  if (value() !== valueOf(p.password)) {
    return { kind: 'mismatch', message: 'Passwords do not match' };
  }
  return null;
});

// --- Async HTTP validator ---
validateHttp(p.username, {
  request: ({ value }) => `/api/check?username=${value()}`,
  onSuccess: (res: any) => res.taken
    ? { kind: 'taken', message: 'Username taken' }
    : null,
  onError: () => ({ kind: 'network', message: 'Could not verify' }),
});

// --- Array item validation ---
function ItemSchema(item: SchemaPathTree<Item>) {
  required(item.name, { message: 'Required' });
  min(item.quantity, 1, { message: 'Min 1' });
}
applyEach(p.items, ItemSchema);

// --- Availability ---
disabled(p.couponCode, { when: ({ valueOf }) => valueOf(p.total) < 50 });
hidden(p.shippingAddress, { when: ({ valueOf }) => !valueOf(p.requiresShipping) });
readonly(p.username);
```

### 3.6 Programmatic Control

```ts
// Replace entire model
this.model.set({ email: '', password: '' });

// Field-level update
this.f.email().value.set('new@email.com');

// Reset form
f().reset({ email: '', password: '' });

// Manual submit
import { submit } from '@angular/forms/signals';
await submit(this.f, { action: async () => { /* ... */ } });
```

---

## 4. Angular Aria (`@angular/aria`)

```bash
pnpm add @angular/aria
```

### Available Patterns
| Import Path | Directives |
|-------------|------------|
| `@angular/aria/accordion` | `Accordion`, `AccordionPanel` |
| `@angular/aria/autocomplete` | `Autocomplete` |
| `@angular/aria/combobox` | `Combobox` |
| `@angular/aria/grid` | `Grid`, `GridColumn`, `GridRow`, `GridCell` |
| `@angular/aria/listbox` | `Listbox`, `ListboxOption` |
| `@angular/aria/menu` | `Menu`, `MenuItem` |
| `@angular/aria/menubar` | `Menubar`, `MenubarItem` |
| `@angular/aria/multiselect` | `Multiselect` |
| `@angular/aria/select` | `Select` |
| `@angular/aria/tabs` | `Tabs`, `TabPanel` |
| `@angular/aria/toolbar` | `Toolbar`, `ToolbarWidget`, `ToolbarWidgetGroup` |
| `@angular/aria/tree` | `Tree`, `TreeItem` |

### Toolbar Example

```ts
import { Component } from '@angular/core';
import { Toolbar, ToolbarWidget, ToolbarWidgetGroup } from '@angular/aria/toolbar';

@Component({
  selector: 'app-editor-toolbar',
  imports: [Toolbar, ToolbarWidget, ToolbarWidgetGroup],
  template: `
    <div ngToolbar aria-label="Formatting toolbar">
      <div ngToolbarWidgetGroup role="radiogroup" aria-label="Alignment">
        <button ngToolbarWidget role="radio" value="left" #left="ngToolbarWidget"
          [aria-checked]="left.selected()">L</button>
        <button ngToolbarWidget role="radio" value="center" #center="ngToolbarWidget"
          [aria-checked]="center.selected()">C</button>
      </div>

      <button ngToolbarWidget value="bold" #bold="ngToolbarWidget"
        [aria-pressed]="bold.selected()">B</button>
    </div>
  `,
})
export class EditorToolbar {}
```

Angular Aria handles: keyboard navigation (arrows, Tab, Enter, Escape), ARIA attributes, focus management, screen reader announcements, and RTL support.

---

## 5. `resource()` & `httpResource()`

### 5.1 Basic resource

```ts
import { resource } from '@angular/core';
import { httpResource } from '@angular/common/http';

// General async operation
const user = resource({
  params: () => ({ id: userId() }),
  loader: ({ params, abortSignal }) =>
    fetch(`/api/users/${params.id}`, { signal: abortSignal }),
});

// HTTP via Angular HttpClient (incl. interceptors)
const weather = httpResource<Weather>(() =>
  `/api/weather?city=${selectedCity()}`
);

// With POST body
const result = httpResource<Response>(() => ({
  url: '/api/data',
  method: 'POST',
  body: { query: searchTerm() },
}));
```

### 5.2 Resource State

```ts
const r = httpResource<Data>(() => '/api/data');

r.value();        // Data | undefined
r.hasValue();     // boolean — also type guard
r.error();        // unknown | undefined
r.isLoading();    // boolean
r.status();       // 'idle' | 'loading' | 'reloading' | 'resolved' | 'error' | 'local'
r.reload();       // re-triggers loader
r.set(value);     // local override
r.update(fn);     // local update
r.snapshot;       // Signal<ResourceSnapshot<Data>>

// Template usage
@if (r.isLoading()) {
  <p>Loading...</p>
} @else if (r.hasValue()) {
  <p>{{ r.value().name }}</p>
} @else if (r.error(); let err) {
  <p>Error: {{ err }}</p>
}
```

### 5.3 SSR Caching

```ts
const data = httpResource<Data>(() => '/api/data', {
  id: 'unique-cache-key', // caches in TransferState for SSR
});
```

### 5.4 Chaining Resources

```ts
const user = httpResource<User>(() => `/api/users/${userId()}`);

const company = resource({
  params: ({ chain }) => chain(user)?.companyId,
  loader: ({ params }) => fetchCompany(params!),
});
```

---

## 6. `injectAsync()` — Lazy Loaded Services

```ts
import { Component, injectAsync, onIdle } from '@angular/core';

@Component({
  selector: 'app-report',
  template: `<button (click)="export()">Export</button>`,
})
export class ReportComponent {
  private exporter = injectAsync(
    () => import('./report-exporter').then(m => m.ReportExporter),
  );

  async export() {
    const exporter = await this.exporter();
    exporter.export();
  }
}
```

### Prefetch Strategies

```ts
// On browser idle
private svc = injectAsync(() => import('./heavy-service'), {
  prefetch: onIdle,
});

// With timeout
private svc = injectAsync(() => import('./heavy-service'), {
  prefetch: () => onIdle({ timeout: 1_000 }),
});

// Custom trigger (e.g., on hover)
private svc = injectAsync(() => import('./heavy-service'), {
  prefetch: () => new Promise(resolve => {
    element.addEventListener('pointerenter', () => resolve(), { once: true });
  }),
});
```

> **Requirement:** The lazy-loaded service must be auto-provided with `@Service()` or `@Injectable({providedIn: 'root'})`.

---

## 7. Template Enhancements

### 7.1 Comments in Elements

```html
<div
  // inline comment
  /* block comment */
  class="foo"
  /* multi
     line */
  id="bar">
</div>
```

### 7.2 Spread Syntax

```html
<!-- Object spread -->
<div [class]="{ ...baseClasses, 'is-active': isActive() }"></div>

<!-- Array spread -->
<app-list [items]="[...defaultItems, 'custom']" />

<!-- Function spread -->
<p>Total: ${{ calculate(...prices, tax) }}</p>
```

### 7.3 @switch Multi-Case & Exhaustive

```html
@switch (status()) {
  @case ('pending')
  @case ('processing') {
    <p class="badge-blue">In progress</p>
  }
  @case ('completed') {
    <p class="badge-green">Done</p>
  }
  @default never;
}
```

### 7.4 Arrow Functions in Templates

```html
<button (click)="item.update(p => ({ ...p, stock: p.stock - 1 }))">
  Decrease
</button>

<p>Total: {{ items().reduce((sum, i) => sum + i.price, 0) }}</p>
```

### 7.5 @boundary — Error Boundaries (Dev Preview)

```html
@boundary {
  <app-checkout-form />
}
@error (let err) {
  <app-error-fallback [error]="err" />
}
```

---

## 8. Router Updates

```ts
import { provideRouter, withExperimentalPlatformNavigation, withExperimentalAutoCleanupInjectors } from '@angular/router';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withViewTransitions(),
      withExperimentalPlatformNavigation(), // native Navigation API
      withExperimentalAutoCleanupInjectors(), // auto-destroy unused injectors
    ),
  ],
};

// Clean up cached route handles
import { destroyDetachedRouteHandle } from '@angular/router';
// Usage inside a custom RouteReuseStrategy
```

---

## 9. Change Detection & Performance

```ts
// ✅ CORRECT: OnPush is default, no need to specify
@Component({
  selector: 'app-fast',
  template: `...`,
})
export class FastComponent {}

// Only if you need eager (legacy Default) detection:
import { ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-legacy',
  template: `...`,
  changeDetection: ChangeDetectionStrategy.Eager, // renamed from Default
})
export class LegacyComponent {}

// Zoneless is default — no setup needed
```

### Performance Checklist
- Use signals + OnPush (default) for precise updates
- Use `NgOptimizedImage` with `NgOptimizedImage` for images
- Use `@defer` for heavy components
- Use `injectAsync()` for heavy services
- Use `httpResource()` for data fetching with built-in loading/error states
- Implement lazy loading for all feature routes

---

## 10. Accessibility (WCAG AA)

### General Rules
- All interactive elements must have accessible names
- Use semantic HTML (`<button>`, `<nav>`, `<header>`) over ARIA when possible
- Manage focus on navigation and form errors
- Ensure color contrast meets WCAG AA minimums
- Support keyboard navigation for all interactive widgets
- Support RTL layouts

### Angular Aria Usage
For complex interactive patterns (menus, tabs, trees, etc.), use Angular Aria directives from `@angular/aria` which handle:
- Keyboard navigation
- ARIA attribute management
- Focus management
- Screen reader announcements
- RTL support

### Image Optimization

```html
<!-- ✅ Correct: NgOptimizedImage -->
<img ngSrc="photo.jpg" width="800" height="600" alt="Description" priority />

<!-- ✅ Correct: Remote images need loader or priority -->
<img ngSrc="https://example.com/photo.jpg" width="800" height="600" alt="Description"
  priority />
```

---

## Quick Reference: Package Imports

| Feature | Import Path |
|---------|-------------|
| `@Service()` | `@angular/core` |
| `injectAsync()` | `@angular/core` |
| `resource()` | `@angular/core` |
| `httpResource()` | `@angular/common/http` |
| `form()`, `FormField`, `FormRoot` | `@angular/forms/signals` |
| `required`, `email`, `pattern`, etc. | `@angular/forms/signals` |
| `submit()` | `@angular/forms/signals` |
| Angular Aria directives | `@angular/aria/<pattern>` (e.g. `@angular/aria/toolbar`) |
| `withViewTransitions()` | `@angular/router` |
| `withExperimentalPlatformNavigation()` | `@angular/router` |
| `provideZonelessChangeDetection()` (only if targeting v20) | `@angular/core` |

---

## Migration Checklist (v21 → v22)

- [ ] Remove explicit `standalone: true`
- [ ] Remove explicit `ChangeDetectionStrategy.OnPush`
- [ ] Remove `provideZonelessChangeDetection()` if migrating from v20 (it's default in v21+)
- [ ] Migrate forms to Signal Forms (`@angular/forms/signals`)
- [ ] Replace `@Injectable({providedIn: 'root'})` with `@Service()`
- [ ] Add `withViewTransitions()` to router
- [ ] Update `ngClass`/`ngStyle` → `[class]`/`[style]`
- [ ] Replace `*ngIf`/`*ngFor` → `@if`/`@for`
- [ ] Update `@HostBinding`/`@HostListener` → `host: {}`
- [ ] Update `@Input()`/`@Output()` → `input()`/`output()`
- [ ] Review images for `NgOptimizedImage`
