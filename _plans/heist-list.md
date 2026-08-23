# Heist List — Implementation Plan

## Context

Per `_specs/heist-list.md`, `/heists` currently shows three static placeholder headings with no actual content. This replaces them with a real, flat list of every heist in the `heists` Firestore collection, visible to any signed-in user, newest-first. Card fields (title, description, assignee codename, status) and scope (flat list, full-collection fetch, no cap) are locked in from the spec.

## Approach

### 1. New hook: `lib/useHeists.ts`

Mirrors `lib/useUsers.ts` exactly (one-time fetch on mount via `getDocs`, `withConverter(heistConverter)`, a `refetch`, and the same `mountedRef` guard pattern) — fetches the full `heists` collection, then sorts client-side by `createdAt` descending (no Firestore `orderBy`/index needed, since the whole collection is already being fetched). Returns `{ heists, loading, error, refetch }`.

### 2. New component: `components/HeistCard/`

Presentational only — takes a single `heist: Heist` prop, renders title, description, assignee codename, and a status badge. Status is derived directly from `finalStatus`: `null` → "Active" (primary/cyan), `"success"` → "Success" (`--color-success`), `"failure"` → "Failure" (`--color-error`). Wrapped in `HudFrame`, matching the app's card treatment elsewhere (home page feature cards).

### 3. New component: `components/HeistList/`

Owns the data fetching (`useHeists()`) and renders one of: a loading message, an error message, an empty-state message, or a grid of `HeistCard`s (`grid-template-columns: repeat(auto-fit, minmax(...))`, matching the home page's `.features` grid and the `/preview` page's skeleton grid).

### 4. Update `app/(dashboard)/heists/page.tsx`

Replace the three placeholder `<div>`/`<h2>` blocks with a `hud-label` eyebrow ("All Heists") and `<HeistList />`. Stays a server component — no data-fetching logic lives in the page itself, matching the `HeistForm`/`AuthForm` pattern where pages are thin wrappers around a client component that owns its own data.

### 5. Tests

- **`tests/components/HeistCard.test.tsx`** (new): renders title/description/assignee for a given heist; the three `finalStatus` values (`null`/`"success"`/`"failure"`) render as "Active"/"Success"/"Failure" respectively.
- **`tests/components/HeistList.test.tsx`** (new): mocks `firebase/firestore`'s `getDocs`/`collection`, matching the `HeistForm.test.tsx` convention. Covers: loading state; error state; empty-collection state; renders one card per heist; heists render newest-first regardless of fetch order.

## Critical Files

- `lib/useHeists.ts` (new)
- `components/HeistCard/HeistCard.tsx`, `HeistCard.module.css`, `index.ts` (new)
- `components/HeistList/HeistList.tsx`, `HeistList.module.css`, `index.ts` (new)
- `app/(dashboard)/heists/page.tsx` (modified)
- `tests/components/HeistCard.test.tsx` (new)
- `tests/components/HeistList.test.tsx` (new)

Reused patterns: `lib/useUsers.ts` (data-fetching hook shape), `components/HeistForm/` (page-as-thin-wrapper convention, HUD styling), `components/HudFrame/` (card framing), `app/(public)/page.module.css`'s `.features` grid (card grid layout).

## Verification

1. `npm run lint` and `npx tsc --noEmit` — no errors.
2. `npx vitest run tests/components/HeistCard.test.tsx tests/components/HeistList.test.tsx` — new tests pass.
3. `npm test` — full suite, no regressions.
4. Manual check in the browser: visit `/heists` signed in. With no heists created yet, confirm the empty-state message renders. After creating a heist via the Create Heist form, confirm it appears as a card on `/heists` with the correct title, description, assignee, and "Active" status.
