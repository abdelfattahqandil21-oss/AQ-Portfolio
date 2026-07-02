## Project Rules

### Stack
Angular v22 + Tailwind CSS v4.3 + TypeScript 6.0 strict + Three.js 0.185

### Package Manager
pnpm only. Never npm or yarn.

### Build
- Dev: `pnpm run start`
- Build: `pnpm run build`

### Folder Structure
```
src/app/
├── core/services/        — Translation, Scroll, ViewTransition, ThreeScene
├── pages/home/           — Home (lazy), Hero (3D scroll journey), About (fixed cube)
└── shared/               — Header, LangSwitcher, Shell layout
```

### Hard Rules
- No `any` — use `unknown` and narrow
- No barrel `index.ts` files
- No class-based state — signals only
- No inline styles — Tailwind classes only (except CSS for @keyframes)
- Commit: `type(scope): message` — types: feat/fix/refactor/chore/docs
- Always `inject()` — never constructor DI
- Always `input()/output()` — never `@Input/@Output`
- No `@HostBinding/@HostListener` — use `host` object
- No `ngClass/ngStyle` — use `class`/`style` bindings
- No `@angular/animations` — use `animate.enter`/`animate.leave`
- No `withViewTransitions()` on router — use `ViewTransitionService.start()`
- Three.js dynamically imported — never `import * as THREE` at top level

### Do Not Re-Discuss
- No SSR — pure SPA
- No component library — Tailwind + PrimeIcons only
- No NgRx or external state management — signals only
- Monochromatic blue-gray brand — no accent colors
- `@Service()` for singletons, bare `@Injectable()` for scoped services
- Signal Forms (`@angular/forms/signals`) for all forms — never Reactive Forms
- Translation: `translate(ar, en, fr, it)` — 4 string args, not config objects
- About section is fixed overlay inside hero template — not separate route
