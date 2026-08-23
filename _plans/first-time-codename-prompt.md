# First-Time Codename Prompt — Implementation Plan

## Context

Per `_specs/first-time-codename-prompt.md`, nothing in the app currently creates a `users/{uid}` Firestore document or a codename for anyone — signup only creates a Firebase Auth account. Today the Create Heist form (`components/HeistForm/HeistForm.tsx`) just shows a dead-end "you need a codename on file" message with no way to fix it. This closes that gap: a reusable prompt that lets a signed-in user set their codename right where they need one, and then resumes what they were doing — starting with the Create Heist form, since that's the only current consumer.

Decisions locked in: codenames must be unique (checked live at submit time via a Firestore query — not perfectly race-proof, accepted for a first pass); the check lives at the point of use rather than centrally in the dashboard layout, but is built as a reusable component so future features can adopt it.

## Approach

### 1. New component: `components/CodenamePrompt/`

Follows the `AuthForm`/`HeistForm` folder convention (`.tsx` + `.module.css` + `index.ts`, `HudFrame` wrapper, `hud-label` eyebrow, matching the app's current HUD theme).

- **`components/CodenamePrompt/CodenamePrompt.tsx`** (`'use client'`):
  - Props: `{ uid: string; onSuccess: () => void }`.
  - Controlled `codename` input, `error`, `submitting` state.
  - On submit: trim and validate non-empty (inline error if blank). Then a live uniqueness check — `query(collection(db, COLLECTIONS.USERS), where('codename', '==', trimmed))` via `getDocs` — if any doc comes back, show "that codename is taken" and stop. Otherwise `setDoc(doc(db, COLLECTIONS.USERS, uid), { id: uid, codename: trimmed })` (deterministic doc ID = uid, matching how `useUsers`/`HeistForm` already look up `users.find(u => u.id === uid)`), then call `onSuccess()`.
  - A thrown error from either the query or the write is caught, shown inline, and does not call `onSuccess()`.
- **`components/CodenamePrompt/CodenamePrompt.module.css`** — reuses the same theme tokens as `HeistForm.module.css`/`AuthForm.module.css` (input, label, error, submit button styles are near-identical; copy the established pattern rather than introducing new conventions).

### 2. `lib/useUsers.ts` — expose a `refetch`

Add a `refetch` function to the returned object (re-runs the same `getDocs` call, reusable for "something changed, get the latest roster"). This is how `HeistForm` will pick up the newly-created `users/{uid}` doc immediately after `CodenamePrompt` succeeds, without a page reload — satisfying the spec's "resumes automatically" requirement.

### 3. `components/HeistForm/HeistForm.tsx` — replace the dead-end block

Where the component currently renders a static "you need a codename on file" message when `currentUserDoc` is null, render `<CodenamePrompt uid={user.uid} onSuccess={refetch} />` instead. Once `refetch()` completes, `useUsers()`'s state updates, `currentUserDoc` becomes non-null, and the real Create Heist form renders on the next render — no navigation, no re-fetching required from the user.

### 4. Tests

- **`tests/components/CodenamePrompt.test.tsx`** (new): renders the form; blocks empty/whitespace submission with an inline error and no Firestore write; blocks a codename that the mocked uniqueness query reports as taken; on a clean submission, calls `setDoc` with the expected shape and then `onSuccess`; a thrown error (from the query or the write) shows an inline error and does not call `onSuccess`.
- **`tests/components/HeistForm.test.tsx`** (modified): the existing "shows a blocked message" test is updated to assert the `CodenamePrompt` form now renders instead of a dead-end message. Add a case confirming that once a codename is set (roster refetch resolves with the current user now included), the real Create Heist form renders in the same session without remounting/navigating.

## Critical Files

- `components/CodenamePrompt/CodenamePrompt.tsx` (new)
- `components/CodenamePrompt/CodenamePrompt.module.css` (new)
- `components/CodenamePrompt/index.ts` (new)
- `lib/useUsers.ts` (modified — add `refetch`)
- `components/HeistForm/HeistForm.tsx` (modified — swap the blocked branch for `<CodenamePrompt>`)
- `tests/components/CodenamePrompt.test.tsx` (new)
- `tests/components/HeistForm.test.tsx` (modified)

Reused patterns: `components/AuthForm/` and `components/HeistForm/` (component/CSS-module/barrel conventions, controlled-input + submit/loading/error shape), `components/HudFrame/` (signature framing), `types/firestore/user.ts` (the `User`/`userConverter` shape this writes to).

## Verification

1. `npm run lint` and `npx tsc --noEmit` — no errors.
2. `npx vitest run tests/components/CodenamePrompt.test.tsx tests/components/HeistForm.test.tsx` — new/updated tests pass.
3. `npm test` — full suite, no regressions.
4. Manual check in the browser: visit `/heists/create` signed in with no codename on record — confirm the codename prompt renders instead of the old dead-end message, submit a codename, and confirm the actual Create Heist form appears immediately without navigating away. Try submitting an already-used codename and confirm it's rejected.
