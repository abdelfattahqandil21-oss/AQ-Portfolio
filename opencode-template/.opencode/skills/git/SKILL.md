---
name: git
description: Git conventions — Conventional Commits, branching, tags, PR workflow
---

# Git Workflow

## Commit Format
```
type(scope): message (max 72 chars, lowercase, no period)
```
Types: `feat` `fix` `refactor` `chore` `docs` `test` `style` `perf` `ci`

## Branching
```
master     — production (protected)
release    — staging
develop    — integration
feature/*  — new features
fix/*      — bug fixes
```

## Before Committing
- `pnpm run build` passes

## Tags
```bash
git tag -a v1.0.0 -m "feat: description"
git push origin v1.0.0
```
