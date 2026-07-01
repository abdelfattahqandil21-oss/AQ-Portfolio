You are an expert in TypeScript, Angular v22, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices
- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular v22 Core Conventions
- Always use standalone components (no NgModules). Do NOT set `standalone: true` — it's default since v20.
- Do NOT set `changeDetection: ChangeDetectionStrategy.OnPush`. OnPush is the **default** since v22. The old Default is now `ChangeDetectionStrategy.Eager`.
- Do NOT use `provideZonelessChangeDetection()` — zoneless is the **default** since Angular v21+. It's redundant in v22.
- Do NOT use `@HostBinding` / `@HostListener`. Use the `host` object in `@Component` / `@Directive` instead.
- Use `input()` / `output()` functions instead of `@Input()` / `@Output()` decorators.
- Use `NgOptimizedImage` for all static images (does not work for inline base64).
- Do NOT use `ngClass` or `ngStyle` — use `class` / `style` bindings instead.
- Use native control flow: `@if`, `@for`, `@switch` instead of `*ngIf`, `*ngFor`, `*ngSwitch`.
- Use `inject()` instead of constructor injection.
- Prefer `computed()` for derived state, `effect()` for side effects.
- Do NOT use `mutate()` on signals — use `set()` or `update()`.

## @Service() Decorator (Angular v22+)
- Use `@Service()` instead of `@Injectable({providedIn: 'root'})` for singleton services:
```ts
import { Service } from '@angular/core';
@Service()
export class MyService {}
```
- Keep `@Injectable()` only when you need non-root providers or constructor DI.

## Signal Forms (`@angular/forms/signals`) — Stable in v22
- **Always use Signal Forms for new forms** — never Reactive Forms or Template-driven forms.
- Import from `@angular/forms/signals`: `form`, `FormField`, `FormRoot`, `required`, `email`, `min`, `max`, `minLength`, `maxLength`, `pattern`, `validate`, `validateTree`, `submit`, `disabled`, `hidden`, `readonly`, `applyEach`, `applyWhen`, etc.

### Model
```ts
interface LoginData { userName: string; password: string; }
readonly loginModel = signal<LoginData>({ userName: '', password: '' });
```

### Form creation
```ts
readonly f = form(this.loginModel, (p) => {
  required(p.userName, { message: 'required' });
  pattern(p.userName, /^[a-zA-Z0-9_]+$/, { message: 'pattern' });
  required(p.password, { message: 'required' });
}, {
  submission: {
    action: async () => { /* runs only when valid */ },
    onInvalid: (field) => { /* runs when validation fails */ },
    ignoreValidators: 'pending' | 'none' | 'all',
  },
});
```

### Template bindings
- `<form [formRoot]="f">` — handles novalidate, preventDefault, submission
- `<input [formField]="f.userName">` — two-way sync

### Field state signals
- `f.userName().value` — WritableSignal of the field value
- `f.userName().valid()` / `.invalid()` / `.errors()` / `.pending()`
- `f.userName().touched()` / `.dirty()`
- `f.userName().disabled()` / `.hidden()` / `.readonly()`
- `f().submitting()` — loading state during submission
- `f().errorSummary()` — array of errors for focus management
- `f().reset(initialValue?)` — reset form state

### Validators
- `required(path, {message?, when?: fn})`
- `email(path, {message?})`
- `min(path, value, {message?})` / `max(path, value, {message?})`
- `minLength(path, length, {message?})` / `maxLength(path, length, {message?})`
- `pattern(path, regex, {message?})`
- `validate(path, ({value, valueOf}) => error | null)` — custom sync validator
- `validateTree(path, (ctx) => error | null)` — cross-field validator
- `validateHttp(path, {request, onSuccess, onError})` — async HTTP validator
- `applyEach(arrayPath, itemSchema)` — validate each array item
- `applyWhen(path, predicate, schemaFn)` / `applyWhenValue(path, predicate, schemaFn)` — conditional validation

## Angular Aria (`@angular/aria`) — Stable in v22
- Install: `pnpm add @angular/aria`
- Headless, accessible WAI-ARIA directives. You provide HTML + CSS + logic, Angular Aria handles keyboard nav, ARIA attrs, focus management, screen readers.
- Available patterns: Accordion, Autocomplete, Combobox, Grid, Listbox, Menu, Menubar, Multiselect, Select, Tabs, Toolbar, Tree
- Import per pattern: `import { Toolbar, ToolbarWidget } from '@angular/aria/toolbar';`
- Use as `ngToolbar`, `ngToolbarWidget` attribute directives.

## Async Reactivity — `resource()` / `httpResource()` (Stable in v22)
```ts
const userResource = resource({
  params: () => ({ id: userId() }),
  loader: ({ params, abortSignal }) => fetch(`/api/users/${params.id}`, { signal: abortSignal }),
  id: 'unique-cache-key', // for SSR TransferState caching
});
```
- `userResource.value()` — current value (undefined if not loaded)
- `userResource.hasValue()` — type guard
- `userResource.error()` — last error
- `userResource.isLoading()` — currently loading
- `userResource.status()` — 'idle' | 'loading' | 'reloading' | 'resolved' | 'error' | 'local'
- `userResource.reload()` — re-trigger loader
- `userResource.set(value)` / `.update(fn)` — local override

### httpResource (uses HttpClient with interceptors)
```ts
const data = httpResource<Response>(() => `/api/items?q=${searchTerm()}`);
```

### Chaining resources
```ts
const companyResource = resource({
  params: ({ chain }) => chain(userResource)?.companyId,
  loader: ({ params }) => fetchCompany(params),
});
```

## Lazy Loading Services — `injectAsync()` (Stable in v22)
```ts
const exporter = injectAsync(() => import('./report-exporter').then(m => m.ReportExporter));
// await exporter() to load on demand
// With prefetch: injectAsync(loader, { prefetch: onIdle })
// Custom prefetch: injectAsync(loader, { prefetch: () => new Promise(...) })
```
- Service must be auto-provided (`@Service()` or `@Injectable({providedIn: 'root'})`).

## Template Enhancements (v22)
- **Comments in elements:** HTML `<!-- -->` and `//` comments allowed inside tags on bindings/properties
- **Spread syntax:** `{...obj}` in object literals, `[...arr]` in arrays, `fn(...args)` in templates
- **@switch multi-case:** `@case ('a') @case ('b') { same output }`
- **@switch exhaustive:** `@default never;` — compile-time error for unhandled union variants
- **Arrow functions:** inline in templates: `(click)="item.update(p => ({...p, stock: p.stock - 1}))"`
- **@boundary (dev preview):** error boundaries in templates:
  ```html
  @boundary { <app-widget /> }
  @error (let err) { <fallback /> }
  ```

## Enter / Leave Animations (`animate.enter`, `animate.leave`) — v22
- No `@angular/animations` required — built into the compiler
- Use on any element inside `@if`, `@for`, `@switch` control flow

### `animate.enter="className"` — CSS class added while element enters
```html
@if (shown()) {
  <div animate.enter="fade-in">Hello</div>
}
```
- Class is added when element enters DOM, removed after all animations finish
- Supports multiple classes: `animate.enter="fade-in scale-up"`
- Dynamic binding: `[animate.enter]="myClass()"`

### `animate.leave="className"` — CSS class added while element leaves
```html
@if (shown()) {
  <div animate.leave="fade-out">Goodbye</div>
}
```
- Class added when element is about to leave; Angular waits for longest animation to finish, then removes the element
- Supports multiple classes and dynamic binding

### Function binding (for GSAP, anime.js, etc.)
```html
@if (shown()) {
  <div (animate.leave)="animateOut($event)">Goodbye</div>
}
```
- `$event` is `AnimationCallbackEvent` with `target` (element) and `animationComplete()`
- **Must call `animationComplete()`** for leave animations to remove the element
- Falls back after 4s (configurable via `MAX_ANIMATION_TIMEOUT` token): `{ provide: MAX_ANIMATION_TIMEOUT, useValue: 6000 }`

### Child animations before parent removal
If `animate.leave` is on a descendant of the element being removed, child animations run **before** the parent is removed.

### Incompatible with legacy `@angular/animations` in same component
Cannot mix `animate.enter`/`animate.leave` with `trigger()`, `state()`, `transition()`, `animate()`, etc. in the same component. Mixing across components via content projection is also unsupported.

### CSS keyframes example (define in component `styles`):
```css
@keyframes dd-in {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes dd-out {
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 0; transform: translateY(-4px); }
}
.dd-enter { animation: dd-in 200ms cubic-bezier(.35,0,.25,1); }
.dd-leave { animation: dd-out 150ms cubic-bezier(.35,0,.25,1); }
```
```html
<ul animate.enter="dd-enter" animate.leave="dd-leave">...</ul>
```

### Testing
- TestBed disables animations by default (CSS animation APIs unavailable in Node)
- Enable with: `TestBed.configureTestingModule({animationsEnabled: true})`

## Router (v22)
- `withExperimentalPlatformNavigation()` — native browser Navigation API integration
- `withExperimentalAutoCleanupInjectors()` — auto-destroy unused route injectors
- `destroyDetachedRouteHandle(handle)` — clean up cached route handles

## State Management
- Use signals for local component state
- Prefer `computed()` over methods for derived data
- Keep state transformations pure
- Use `resource()` / `httpResource()` for async data fetching
- Use `linkedSignal()` for dependent state that needs write access

## Project-Specific Conventions

### Tailwind CSS v4

#### Setup
- `styles.css`: `@import "tailwindcss"` (PostCSS plugin `@tailwindcss/postcss` in `.postcssrc.json`)
- No `tailwind.config.js` — all config via CSS `@theme` and `@custom-variant`
- `@import "tailwindcss"` replaces v3's `@tailwind base/components/utilities` — not needed in v4
- Do NOT use `@apply` — use utility classes directly in HTML

#### `@theme {}` — Design Tokens
```css
@theme {
  --color-primary: #0d4b7c;
  --color-accent: #f48432;
  --font-primary: "almarai", sans-serif;
  --radius-xl: 1.5rem;
  --animate-fade-in: fade-in 220ms ease both;
}
```
- Any `--*` property in `@theme` becomes a utility: `bg-primary`, `text-accent`, `font-primary`, `rounded-xl`, `animate-fade-in`
- Use `:root {}` only for CSS custom properties that need runtime override via class

#### Color Utilities with Opacity Modifiers
```html
<div class="bg-primary text-white/85 border-accent/30"></div>
```
- `text-white/85` = 85% opacity white
- `bg-accent/20` = 20% opacity accent (generates `color-mix(in oklab, var(--color-accent) 20%, transparent)`)
- `bg-black/50`, `border-white/10`, etc. — any color supports `/opacity`
- Opacity range: `/0` through `/100` (percent), or `/0.5` for decimal

#### Spacing & Sizing
- `p-3` = 12px, `px-5` = 20px horizontal, `py-2` = 8px vertical
- `gap-2` = 8px gap, `gap-0.5` = 2px, `gap-3` = 12px
- `w-40` = 160px, `h-12` = 48px, `min-w-[200px]` = arbitrary value
- In v4, spacing scale: `1` = 4px, `2` = 8px, `3` = 12px, `4` = 16px, `5` = 20px, etc.

#### Border Radius
- `rounded-sm` = 4px, `rounded` (md) = 6px, `rounded-lg` = 8px, `rounded-xl` = 12px, `rounded-2xl` = 16px
- Arbitrary: `rounded-[10px]`, `rounded-[20px]`

#### Typography
- `text-[13px]` = arbitrary font size, `text-sm` = 14px, `text-lg` = 18px
- `font-medium` = 500, `font-semibold` = 600, `font-bold` = 700
- `leading-none` = line-height 1, `leading-tight` = 1.25

#### Hover, Focus, Active States
```html
<button class="bg-accent/20 hover:bg-accent/40 focus:bg-accent/30 active:bg-accent/60">
```
- Always use accent color with opacity for "light" hover: `hover:bg-accent/20` (very subtle), `hover:bg-accent/40` (medium)
- On dark backgrounds, `hover:bg-accent/20 hover:text-white` adds a subtle orange glow
- On white backgrounds, `hover:bg-accent/20 hover:text-accent` adds subtle tint + colored text
- Full accent: `hover:bg-accent hover:text-white` (solid orange like the active state)
- Button transition: `transition-all duration-150` or `transition-colors duration-200`

#### Active / Current State (not hover)
```html
<button
  class="..."
  [class.bg-accent]="isActive('route')"
  [class.text-white]="isActive('route')"
>
```
- Active state uses full `bg-accent` (solid) to distinguish from hover's `bg-accent/XX`

#### Chevron / Icon Rotation
```html
<i class="pi pi-chevron-down transition-transform duration-200"
   [class.-rotate-180]="open()"
></i>
```
- Use `-rotate-180`, `rotate-180`, `-rotate-90` for chevron/arrow rotation
- Always add `transition-transform duration-200` for smooth animation

#### Fixed Positioning
```html
<nav class="fixed top-0 left-0 right-0 h-16 z-100">
```
- `z-100` / `z-200` — canonical z-index values (no brackets needed)
- `top-0 left-0 right-0` = sticky to top edges

#### Flexbox Layout
```html
<div class="flex items-center gap-3 shrink-0">
<ul class="flex items-center gap-0.5 flex-1 justify-center">
```
- `flex-1` = `flex: 1`, `shrink-0` = `flex-shrink: 0`
- `items-center` = align-items center, `justify-center` = justify-content center
- `flex-col` = flex-direction column

#### Dropdown / Popover Positioning
```html
<div class="relative">
  <ul class="absolute top-full mt-1 inset-e-0 z-200">
```
- `relative` on parent, `absolute` on dropdown
- `top-full` = directly below parent, `mt-1` = 4px gap
- `inset-e-0` = `inset-inline-end: 0` (canonical form of `end-0`) — RTL-aware logical property (right edge in LTR, left edge in RTL)
- Do NOT use `left-0` or `right-0` for dropdowns in RTL apps — use `start-0` / `inset-s-0`

#### Dropdown Menu Styling
```html
<ul class="min-w-[200px] list-none p-1.5 bg-white border border-[#e2ecf8] rounded-xl shadow-lg flex flex-col gap-px">
```
- White bg, light blue-gray border, large radius, soft shadow
- `gap-px` = 1px gap between items
- `p-1.5` = 6px padding inside dropdown

#### Dropdown Items
```html
<li class="flex items-center gap-2 px-3.5 py-2 rounded-xl cursor-pointer text-[13px] font-medium text-primary
          transition-all duration-150 hover:bg-accent/20 hover:text-accent">
```
- `px-3.5` = 14px horizontal padding, `py-2` = 8px vertical
- `cursor-pointer` for clickable items

#### Responsive Breakpoints
```html
<div class="flex max-xl:hidden">        <!-- hidden below xl (~1280px) -->
<div class="hidden max-xl:flex">        <!-- flex below xl, hidden above -->
<div class="flex max-xl:flex-col">      <!-- column layout on mobile -->
```
- `max-xl:*` = applies below xl breakpoint (< 1280px)
- v4 breakpoints: `sm` (640), `md` (768), `lg` (1024), `xl` (1280), `2xl` (1536)
- `max-*` prefix = below breakpoint (responsive `max-width` media query)
- No prefix = applies at all sizes

#### Mobile Menu (Accordion-style)
```html
<ul class="max-xl:overflow-hidden max-xl:transition-all max-xl:duration-400"
    [class.max-xl:!max-h-0]="!open()"
    [class.max-xl:!max-h-[2000px]]="open()"
    [class.max-xl:!opacity-0]="!open()"
    [class.max-xl:!opacity-100]="open()"
    [class.max-xl:!overflow-visible]="open()">
```
- Use `max-h-0` / `max-h-[2000px]` + `opacity` with `transition-all` for smooth open/close
- `!` prefix = `!important` (needed to override inline or higher-specificity styles)

#### Shadow
- `shadow-sm`, `shadow` (default), `shadow-md`, `shadow-lg`, `shadow-xl`
- `shadow-lg` = `0 10px 15px -3px rgb(0 0 0 / 0.1)` etc.

#### Border
- `border` = 1px solid current theme border color
- `border-[#e2ecf8]` = arbitrary color
- `border-accent/30` = border with 30% opacity accent
- `border-none` = no border

#### Animations — `@keyframes` + `animate-*`
```css
/* Define in component styles or global CSS */
@keyframes dd-in {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}
.dd-enter { animation: dd-in 200ms cubic-bezier(.35,0,.25,1); }
```
```html
<ul animate.enter="dd-enter" animate.leave="dd-leave">
```
- Use `animate.enter`/`animate.leave` (Angular v22 built-in) instead of `animate-[...]` arbitrary values
- Define `@keyframes` + CSS classes in component `styles`, reference by class name
- For Tailwind `animate-*` theme: define `--animate-name: keyframes duration ...` in `@theme`

#### Opacity Modifiers (applied to any color)
- `text-white/85` — 85% opacity white text
- `bg-primary/90` — 90% opacity primary background
- `border-accent/30` — 30% opacity accent border
- `opacity-50` — element-level opacity (not color-mix)
- `/opacity` modifier uses CSS `color-mix()` for true color blending

#### Arbitrary Values (use sparingly)
```html
<div class="text-[13px] min-w-[200px] px-3.5 bottom-[calc(100%+8px)]">
```
- Square brackets for one-off values not in the design system
- Common: `text-[13px]`, `min-w-[200px]`, `px-3.5`, `z-100`, `text-[15px]`
- Avoid arbitrary values where theme tokens exist

#### RTL with Logical Properties
- `end-0` = `inset-inline-end: 0` (RTL-aware)
- `start-0` = `inset-inline-start: 0` (RTL-aware)
- `ms-1` = `margin-inline-start: 4px` (RTL-aware margin)
- `me-1` = `margin-inline-end: 4px`
- `ps-3` = `padding-inline-start: 12px`
- In Angular template use `[dir]` binding on root element, not Tailwind `rtl:` variants
- Canonical v4 forms: prefer `inset-e-0` over `end-0`, `inset-s-0` over `start-0`

#### Transition
```html
<button class="transition-all duration-150 hover:bg-accent/20">
<i class="transition-transform duration-200">
```
- `transition-all` = all animatable properties
- `transition-transform` = only transform (for rotation)
- `transition-colors` = only color/background/border-color
- `transition-none` = no transition
- `duration-150` = 150ms, `duration-200` = 200ms, `duration-400` = 400ms

#### Container Queries
```html
<div class="@container">
  <div class="flex flex-col @md:flex-row">
```
- `@container` = enables container queries on this element
- `@md:*` = container is at least md breakpoint
- Must be enabled in project if used

### Icons
- Use PrimeIcons exclusively: `<i class="pi pi-user"></i>`

### Translation System
- `TranslationService.translate(arabicText, englishText)` — inline ar/en pairs
- Service sets `<html lang>` + `dir` via effect, saves to localStorage
- Template usage: `{{ translation.translate('مرحبا', 'Hello') }}`
- `translation.dir()` returns `'rtl'` or `'ltr'`

### View Transitions
- Router: `withViewTransitions()` in `provideRouter`
- Language toggle: `ViewTransitionService.start(() => { ... })` wraps changes in `document.startViewTransition()`

### Forms
- Always use Signal Forms (`@angular/forms/signals`)
- Signal Forms schema with `required()`, `pattern()`, etc.
- FormRoot for submission, FormField for input binding

### File Structure
- Pages: `feature/page-name/page-name.page.ts` + `page-name.page.html`
- Components within pages: `feature/page-name/components/component-name/component-name.ts`
- Page component imports sub-components via `imports: [SubComponent]`

### Fonts & Arabic
- Primary font: Almarai (Arabic), Montserrat (English numbers)
- `<html lang="ar" dir="rtl">`
- Dynamic: TranslationService sets lang + dir via effect

### Accessibility (WCAG AA)
- All interactive elements must have accessible names
- Use semantic HTML over ARIA when possible
- Focus management on navigation and error states
- Color contrast minimums observed
- Use Angular Aria for complex interactive patterns
