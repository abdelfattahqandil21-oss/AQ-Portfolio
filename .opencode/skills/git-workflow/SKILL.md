---
name: git-workflow
description: Git conventions — branching, commit format, PR checklist, tags
---

# Git Workflow

## Commit Format — Conventional Commits
```
type(scope): short description (max 72 chars, lowercase, no period)
```
Types: `feat` `fix` `refactor` `chore` `docs` `test` `style` `perf` `ci`

## Branching
```
master     — production (protected)
release    — staging/release candidates
develop    — integration
feature/*  — feature/user-profile
fix/*      — fix/cart-total
```

## Before Committing
- `pnpm run build` passes

## Tags
```bash
git tag -a v1.0.0 -m "feat: description"
git push origin v1.0.0
```
