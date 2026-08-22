# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Pocket Heist — starter project for the Claude Code Masterclass. A Next.js app (App Router) where users create and manage "heists" (tiny office missions/pranks assigned to coworkers).

## Commands

```bash
npm install       # install dependencies
npm run dev       # start dev server (http://localhost:3000)
npm run build     # production build
npm run start     # serve production build
npm run lint      # eslint (flat config, eslint-config-next)
npm test          # run vitest test suite
```

Run a single test file: `npx vitest run tests/components/Navbar.test.tsx`
Run tests matching a name: `npx vitest run -t "renders the main heading"`
Watch mode (default vitest behavior): `npx vitest`

There is no typecheck script; use `npx tsc --noEmit` if needed.

## Architecture

**Stack**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4. Tests use Vitest + Testing Library + jsdom.

**Route groups**: `app/` uses two parallel route groups with different layouts:

- `app/(public)/` — unauthenticated pages (`/`, `/login`, `/signup`, `/preview`). Layout wraps children in `<main className="public">`, no navbar.
- `app/(dashboard)/` — authenticated pages (`/heists`, `/heists/create`, `/heists/[id]`). Layout renders `<Navbar />` above `<main>`.

Both groups sit under the root `app/layout.tsx`, which sets metadata and imports `app/globals.css`.

**Routing/auth note**: `app/(public)/page.tsx` (the `/` route) is intended purely as a splash/redirect page — it should route logged-in users to `/heists` and logged-out users to `/login`. This redirect logic is not yet implemented (see comment at top of that file).

**Current state**: Most pages are unstyled/unimplemented placeholders (headings only) — this is an early scaffold. `components/Navbar` is the only real component so far.

**Styling conventions**:

- Tailwind v4 with CSS-based config (`@theme` block in `app/globals.css`, no `tailwind.config.js`). Theme tokens: `--color-primary`, `--color-secondary`, `--color-dark`, `--color-light`, `--color-lighter`, `--color-success`, `--color-error`, `--color-heading`, `--color-body`, `--font-sans` (Inter, loaded via Google Fonts `@import`).
- Component-scoped styles use CSS Modules (e.g. `Navbar.module.css`) with `@reference "../../app/globals.css";` at the top so `@apply` can use the shared theme tokens.
- Shared generic layout classes live in `globals.css`: `.page-content`, `.center-content`, `.form-title` — reuse these instead of re-styling per page.
- Icons come from `lucide-react` (e.g. `Clock8` used as the logo mark, split across the "Po" / "cket Heist" text).

**Component structure**: Components live under `components/<Name>/` with `<Name>.tsx`, an optional `<Name>.module.css`, and an `index.ts` barrel file re-exporting the default export (`export { default } from "./Navbar"`). Import via the `@/` path alias (maps to repo root, configured in `tsconfig.json`).

**Tests**: Colocated under `tests/` mirroring the source structure (e.g. `tests/components/Navbar.test.tsx` tests `components/Navbar`), not colocated next to source files. Vitest config (`vitest.config.mts`) uses `vite-tsconfig-paths` so the `@/` alias works in tests, and `vitest.setup.ts` loads `@testing-library/jest-dom/vitest` matchers globally (`globals: true`, so `describe`/`it`/`expect` need no import).

## Git Worktree Conventions

Each feature gets exactly one persistent branch: `claude/feature/<feature_slug>` (created by the `/spec` command), holding its spec, plan, and implementation together — don't create separate branches per phase.

If a worktree needs its own branch because `claude/feature/<feature_slug>` is already checked out elsewhere (e.g. in the main working copy), name it with a purpose suffix — `claude/feature/<feature_slug>-spec`, `-plan`, `-impl` — and rebase it back onto `claude/feature/<feature_slug>` and delete it as soon as its work is committed. Never leave a throwaway branch dangling.

Prefer keeping the main working copy checked out on `main` rather than a feature branch, so worktrees can check out `claude/feature/<feature_slug>` directly without needing a throwaway branch at all.

**Use `git rebase`, not `git merge`, when combining branches** — keep history linear rather than introducing merge commits.
