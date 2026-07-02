# Project Context

## Last Updated
2026-07-02

## What This Project Does
Personal portfolio for Abdelfattah Qandil (AQ) — cinematic 3D scroll journey with Three.js wireframe cube, multi-language support (ar/en/fr/it), and a fixed About section framing text inside a 3D cube.

## Current Focus
Hero-About v1 is complete. Next: add CV download + real GitHub URL to craft slide buttons, Lighthouse audit, RTL/LTR testing.

## Decisions Made — Do Not Re-Discuss

### Angular v22 (Released June 2026)
- Standalone components are default — do NOT set `standalone: true`
- `ChangeDetectionStrategy.OnPush` is the default — do NOT set it. The old default is now `ChangeDetectionStrategy.Eager`
- Zoneless is the default — do NOT use `provideZonelessChangeDetection()`
- `@Service()` = `@Injectable({providedIn: 'root'})` — use it for singleton services
- Bare `@Injectable()` (no providedIn) requires `providers: []` on consuming components
- Use `inject()` always — never constructor DI
- Use `input()/output()` functions — never `@Input/@Output` decorators
- No `@HostBinding/@HostListener` — use `host` object in `@Component`
- No `@angular/animations` — use `animate.enter`/`animate.leave` built-in
- No `ngClass/ngStyle` — use `class`/`style` bindings
- Use `@if/@for/@switch` — never `*ngIf/*ngFor/*ngSwitch`
- Use `computed()` for derived state, `effect()` for side effects
- Use `resource()`/`httpResource()` for async data fetching
- Use `injectAsync()` for lazy-loaded services
- Use `linkedSignal()` for dependent state needing write access

### Signal Forms (`@angular/forms/signals`)
- Always use Signal Forms for new forms — never Reactive Forms or Template-driven forms
- `form()`, `required()`, `pattern()`, `email()`, `min()`, `max()`, `submit()`
- `<form [formRoot]="f">`, `<input [formField]="f.fieldName">`

### Three.js
- Dynamically imported per component (`await import('three')`) — no top-level `import * as THREE`
- Init in `afterNextRender(async () => ...)` — not `ngOnInit` or `afterRender`
- `RUN_OUTSIDE_ANGULAR` injection token for the render loop
- Canvas has `aria-hidden="true"` + `role="img"` + `aria-label` on the container

### Translation
- 4 languages: 'ar', 'en', 'fr', 'it'
- `TranslationService.translate(ar, en, fr, it)` — inline in templates
- Direction derived from `currentLang() === 'ar'` — no `dir()` method on the service
- Lang + dir set via `effect()` on `<html>`, persisted to `localStorage`

### View Transitions
- Manual only — do NOT use `withViewTransitions()` on router
- `ViewTransitionService.start(callback)` wraps changes in `document.startViewTransition()`
- `ApplicationRef.tick()` called inside the callback
- Pseudo-element CSS is in global styles (`view-transitions.css`) — not component styles
- 3D page-flip animation with `perspective(800px) rotateY`

### Hero Scroll Journey
- 3 slides (Welcome → About → Craft), each 150vh
- Plus 130vh extra spacer for about section = 580vh total
- Fade zone in LAST viewport of heroContentVh (350vh → 450vh = 100vh range)
- `heroFadeProgress` goes 0→1 over that 100vh range
- `aboutReveal` triggers at `heroFadeProgress > 0.35` (≈385vh)
- Dark overlay uses `var(--color-surface-50)` to match `bg-surface-50`

### About Section (fixed overlay, z-3)
- Fixed overlay inside hero template (not in document flow)
- Own Three.js scene: wireframe cube `BoxGeometry(3.0, 2.0, 3.0)`, `#b8c8d8`, opacity 0.5
- Cube starts at 4× scale, shrinks to 1× over first 25% of about section scroll
- Text fades in + scales up alongside the cube zoom
- `rotation.y = scrollProgress × π × 4` (2 full turns)
- Position: centered, shifts left for non-Arabic (`x = -0.7`, `translate(-6%)`) or right for Arabic (`x = 0.7`, `translate(6%)`)
- Name, bio, tech badges centered within the cube's visual area

### Design System
- **No accent/brand color** — monochromatic blue-gray only
- Color palettes: `surface-50..900` (backgrounds), `metal-50..900` (text/ui)
- `--color-surface` default: surface-500
- `--color-metal` default: metal-500
- Defined in `src/styles/theme.css` via `@theme {}`
- Scrollbar hidden globally (`scrollbar-width: none` + `::-webkit-scrollbar`)

### Icons
- PrimeIcons only: `<i class="pi pi-..."></i>`

### Languages
- `<html lang="ar" dir="rtl">` by default
- TranslationService dynamically sets lang + dir

### Header
- Fixed dark bar, metallic AQ logo (Armelie font, CSS gradient), mobile hamburger
- Nav items + LangSwitcher with glow-pulse animation + click-outside close

## Git Workflow
- `master` — production-ready (protected)
- `release` — staging/release candidates
- `develop` — integration branch for features
- Feature branches from `develop`
- Tags: `hero-about-v1`

## Testing (Vitest)
- Vitest v4.1.9 + jsdom + @testing-library/angular + @testing-library/jest-dom
- `ng test` runs all specs — 56 tests across 11 files, all passing
- Config: `vitest.config.ts`, setup: `src/test-setup.ts`
- `tsconfig.spec.json` with `vitest/globals` + `@testing-library/jest-dom` types
- `angular.json` test target uses `@angular/build:unit-test`
- Tests next to source files — `<name>.spec.ts` alongside `<name>.ts`
- Service tests use `TestBed` + `ApplicationRef.tick()` for zoneless signal flushing
- Component tests can use `render()` from `@testing-library/angular` or `TestBed.createComponent`
- Three.js mock in `three-scene.spec.ts` uses `function` keyword in `vi.mock()` factory
- Test files: TranslationService (6), ScrollService (11), ViewTransitionService (8), ThreeSceneService (4), Hero (11), Header (4), LangSwitcher (5), AboutSection (4), App (1), Home (1), Shell (1)

## Known Tech Debt / Issues
- CV download link and real GitHub URL not yet added to craft slide
- No Lighthouse audit yet
- RTL/LTR about section layout not fully tested
- 6 unhandled Three.js WebGL rejections in about/home spec files (jsdom has no WebGL — cosmetic only, tests pass)
- Build command: `pnpm run build`

## Non-Obvious File Map
- `src/app/pages/home/hero/hero.ts` — HeroSection: 3D scene + scroll signals + dive transition
- `src/app/pages/home/about/about.ts` — AboutSection: own Three.js scene, fixed overlay
- `src/core/services/translation/translation.ts` — 4-lang translate, no `dir()` method
- `src/core/services/scroll/scroll.ts` — ScrollService with scrollY/progress/direction/velocity
- `src/core/services/view-transition/view-transition.ts` — manual startViewTransition wrapper
- `src/styles/theme.css` — @theme with surface + metal color palettes
- `src/styles/view-transitions.css` — global ::view-transition pseudo-element keyframes
- `src/styles/base.css` — body/font/scrollbar, Armelie @font-face
- `vitest.config.ts` — Vitest config with jsdom + Angular test setup
- `src/test-setup.ts` — imports `@testing-library/jest-dom/vitest` matchers
