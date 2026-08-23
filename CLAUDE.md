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

**Routing/auth note**: `/` is a normal landing page — it does not redirect based on auth state, and both logged-in and logged-out users can view it. `/login` and `/signup` use `useAuthRedirect` (`lib/useAuthRedirect.ts`) to push logged-in users to `/heists`; `AuthForm` also pushes to `/heists` immediately after a successful login/signup. The `(dashboard)` route group is guarded by `useRequireAuth` (`lib/useRequireAuth.ts`), called from `app/(dashboard)/layout.tsx`, which redirects logged-out users to `/login`.

**Current state**: Most pages are unstyled/unimplemented placeholders (headings only) — this is an early scaffold. `components/Navbar` is the only real component so far.

**Styling conventions**:

- Tailwind v4 with CSS-based config (`@theme` block in `app/globals.css`, no `tailwind.config.js`). Theme tokens: `--color-primary`, `--color-secondary`, `--color-dark`, `--color-light`, `--color-lighter`, `--color-success`, `--color-error`, `--color-heading`, `--color-body`, `--font-sans` (Inter, loaded via Google Fonts `@import`).
- Component-scoped styles use CSS Modules (e.g. `Navbar.module.css`) with `@reference "../../app/globals.css";` at the top so `@apply` can use the shared theme tokens.
- Shared generic layout classes live in `globals.css`: `.page-content`, `.center-content`, `.form-title` — reuse these instead of re-styling per page.
- Icons come from `lucide-react` (e.g. `Clock8` used as the logo mark, split across the "Po" / "cket Heist" text).

**Component structure**: Components live under `components/<Name>/` with `<Name>.tsx`, an optional `<Name>.module.css`, and an `index.ts` barrel file re-exporting the default export (`export { default } from "./Navbar"`). Import via the `@/` path alias (maps to repo root, configured in `tsconfig.json`).

**Tests**: Colocated under `tests/` mirroring the source structure (e.g. `tests/components/Navbar.test.tsx` tests `components/Navbar`), not colocated next to source files. Vitest config (`vitest.config.mts`) uses `vite-tsconfig-paths` so the `@/` alias works in tests, and `vitest.setup.ts` loads `@testing-library/jest-dom/vitest` matchers globally (`globals: true`, so `describe`/`it`/`expect` need no import).

## Development Workflow

To develop a new feature:

1. Use the `/spec` skill to create a feature spec: `/spec "Your feature description"`. This generates a spec file in `_specs/` (see `_specs/template.md` for the structure), creates a branch `claude/feature/<feature_slug>`, and fills in the open questions.
2. Claude plans the implementation based on the spec (typically via a Plan agent), writing a detailed plan to `_plans/<feature_slug>.md`.
3. Implement the feature: write code, tests, and docs per the plan.
4. Verify: lint, typecheck, and run the test suite to ensure everything works.
5. Rebase onto `main` and fast-forward to merge (see **Git Flow** below).

## Implementation Guidelines

When implementing any library or framework-specific features, **always check the appropriate documentation using the Context7 MCP server before writing any code**. This ensures implementation aligns with current best practices and API contracts, rather than relying on potentially outdated training data.

## Git Flow

- **Always use the `/commit-message` skill to generate commit messages** before creating any commits. This ensures consistent, high-quality messages across the codebase.
- No git worktrees. Work directly in the single main checkout.
- `main` is the base branch. For a new feature, check out a new branch from `main` (e.g. `claude/feature/<feature_slug>` when created via `/spec`, or any descriptive name otherwise) and do all the work — spec, plan, implementation — on that one branch.
- When the feature is done, rebase the branch onto `main` and fast-forward merge. Use `git rebase`, not `git merge`, when combining branches — keep history linear rather than introducing merge commits.
- Don't create separate branches per phase of a feature, and don't leave throwaway branches dangling — clean them up once merged.
