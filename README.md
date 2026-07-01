# AQ Portfolio — Abdelfattah Qandil

Personal portfolio built with **Angular v22**, **Tailwind CSS v4**, and **Three.js**. Features a cinematic scroll-driven hero journey with a 3D wireframe cube transitioning into a fixed About section.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Angular v22 (standalone, zoneless, signal-based) |
| Styling | Tailwind CSS v4 (`@import "tailwindcss"`, no config file) |
| 3D Engine | Three.js (lazy-loaded — dynamic `import('three')` per component) |
| Icons | PrimeIcons |
| Fonts | Almarai (Arabic), Inter (Latin), Armelie (logo) |
| Package Manager | pnpm |

## Architecture

```
src/
├── app/
│   ├── core/services/
│   │   ├── scroll/           — ScrollService (scrollY, progress, velocity, direction)
│   │   ├── translation/      — TranslationService (ar/en/fr/it, sets lang + dir)
│   │   └── view-transition/  — ViewTransitionService (3D page-flip wrapper)
│   ├── pages/
│   │   └── home/
│   │       ├── hero/         — HeroSection (3D scroll journey, dive transition)
│   │       └── about/        — AboutSection (fixed overlay, cube framing text)
│   │       └── home.ts       — Home page (lazy-loaded, imports hero)
│   └── shared/
│       ├── components/
│       │   ├── header/       — Fixed nav with metallic AQ logo + LangSwitcher
│       │   └── lang-switcher/— Language dropdown with glow-pulse animation
│       └── layouts/
│           └── shell/        — Shell layout (header + router outlet, lazy)
├── styles/
│   ├── theme.css             — @theme tokens (surface-50..900, metal-50..900)
│   ├── base.css              — body bg, scrollbar hiding, Armelie @font-face
│   └── view-transitions.css  — 3D flip-out/flip-in ::view-transition keyframes
└── styles.css                — Entry point: @import tailwind + all partials
```

## Key Features

### Hero Scroll Journey
- Three slides (Welcome → About → Craft with CV/GitHub), each 150vh
- Smooth scroll-driven signals: `contentFade`, `sceneFade`, `darkOverlay`, `aboutReveal`
- Three.js scene: wireframe edges, particles, torus knot — all dynamically imported
- Cinematic dive: slides sink + scale, scene darkens, transitions to fixed About section

### About Section
- Fixed overlay (`z-3`, `bg-surface-50`) activated by `heroFadeProgress > 0.35`
- Own Three.js scene: centered wireframe cube (`BoxGeometry 3.0×2.0×3.0`) framing text
- **Cube zoom-in**: starts at 4× scale, shrinks smoothly to 1× over first 25% of scroll
- **Text reveal**: fades in + scales up alongside the cube zoom
- Scroll-driven cube rotation (`rotation.y`)
- RTL/LTR-aware positioning: cube + text shift left (non-Arabic) or right (Arabic)

### Translation System
- 4 languages: Arabic, English, French, Italian
- `TranslationService.translate(ar, en, fr, it)` — inline in templates
- Auto-sets `<html lang>` + `dir` via `effect()`, persists to `localStorage`
- 3D page-flip view transition on language switch

### View Transitions
- Manual `ViewTransitionService.start()` wrapping language changes
- `ApplicationRef.tick()` called inside `startViewTransition` callback
- `::view-transition-old(root)` and `::view-transition-new(root)` with `perspective(800px) rotateY` keyframes

## Getting Started

```bash
pnpm install
pnpm run start       # dev server
pnpm run build       # production build
```

### Build Output

| Chunk | Raw Size | Transfer Size |
|-------|----------|---------------|
| `main` (core) | ~226 kB | ~61 kB |
| `styles` | ~42 kB | ~7 kB |
| `three-module` (lazy) | ~735 kB | ~154 kB |
| `home` (lazy) | ~21 kB | ~6 kB |
| `shell` (lazy) | ~9 kB | ~3 kB |

## Git Workflow

```
master    — production-ready
release   — staging / release candidates
develop   — integration branch for features
```

Feature branches branch from `develop`, PR into `develop` → `release` → `master`.

## Tags

- `hero-about-v1` — Initial hero + about section with Three.js cube

## Design Tokens

Defined in `src/styles/theme.css` via `@theme {}`:

```
surface-50 (#0a0e1a)    → surface-900 (#eaeef5)  — background/base palette
metal-50 (#1a1f2e)      → metal-900 (#f0f2f8)    — text/ui palette
```

Brand is monochromatic blue-gray (no accent colors).
