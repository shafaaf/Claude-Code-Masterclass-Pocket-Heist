# Create Heist Form — Implementation Plan

## Context

Per `_specs/create-heist-form.md`, `/heists/create` is currently a static placeholder (heading + inert button). This plan wires it up to actually create a heist: a form with title, description, and an assignee picker (sourced from a `users` collection), which writes a `CreateHeistInput` document to the `heists` Firestore collection and redirects to `/heists` on success.

This is also the **first real Firestore usage in the app** — confirmed via full-repo research: no `db` export exists in `lib/firebase.ts` (Auth-only today), no `types/firestore/user.ts` exists, and nothing anywhere creates a `users` document or a codename. Per the spec's Dependencies section, that gap (wiring codename capture into signup) is explicitly **out of scope** here — this feature only reads from `users` as if it were already populated, and correctly blocks heist creation for any signed-in user without a codename on record (which, until a future feature closes that gap, will be everyone).

**Deadline calculation note:** the spec calls for the deadline to be computed from server time rather than the client's clock. Firestore's client SDK has no way to do server-side arithmetic on a `serverTimestamp()` sentinel before a write commits (that requires a Cloud Function trigger, and this repo has no `functions/` directory — out of scope to add one). The pragmatic implementation: `createdAt` uses `serverTimestamp()` for accuracy on that field, while `deadline` is computed client-side as `now + 48h` at submit time. In practice these are the same instant, off only by network latency (milliseconds) — not the client's clock being wrong. Flagging this tradeoff explicitly rather than silently deviating from the spec's stated preference.

## Approach

### 1. Firestore `db` instance — `lib/firebase.ts`

Add `export const db = getFirestore(app);` alongside the existing `auth` export.

### 2. New type: `types/firestore/user.ts`

Following the `firestore-schemas` skill convention (mirrors `heist.ts`):

```ts
export interface User {
  id: string;
  codename: string;
}

export const userConverter = { toFirestore, fromFirestore };
```

No `CreateUserInput`/`UpdateUserInput` — this feature only ever _reads_ users; writing them is out of scope (future signup feature). Update `types/firestore/index.ts` to `export * from './user'` and add `COLLECTIONS.USERS: 'users'`.

### 3. New hook: `lib/useUsers.ts`

One-time fetch (codenames are fixed at signup per the resolved spec question, so no live subscription needed): `getDocs(collection(db, COLLECTIONS.USERS).withConverter(userConverter))` on mount. Returns `{ users: User[], loading: boolean, error: string | null }`, matching the `{ user, checking }` shape convention already established by `useRequireAuth`.

### 4. New component: `components/HeistForm/`

Follows the `AuthForm` folder convention (`.tsx` + `.module.css` + `index.ts` barrel, wrapped in the existing `HudFrame` HUD signature, `hud-label` eyebrow, `form-title` heading — consistent with the rest of the app's current theme).

- **`components/HeistForm/HeistForm.tsx`** (`'use client'`):
  - `useRequireAuth()` for the current Firebase Auth user (the `(dashboard)` layout already guards the route, so `user` is expected non-null by the time this renders; the hook is called again here — same pattern `useAuthRedirect` uses per-page — to get the actual `user` object, not just the guard).
  - `useUsers()` for the full roster.
  - Derives `currentUserDoc = users.find(u => u.id === user.uid)` and `assignableUsers = users.filter(u => u.id !== user.uid)`.
  - Render states, in order: loading roster → roster failed to load → **no codename on record** (blocked message + link back to `/heists`, no form rendered) → the form itself.
  - Controlled inputs: `title`, `description`, `assignedTo` (native `<select>` populated from `assignableUsers`, showing codenames).
  - Client-side validation on submit (non-empty title/description, an assignee selected) — inline field errors, no Firestore call attempted if invalid.
  - Submit: builds a `CreateHeistInput` (`createdAt: serverTimestamp()`, `deadline` computed per the note above, `finalStatus: null`, `createdBy`/`createdByCodename` from the current user), `addDoc`s it with `heistConverter`, then `router.push('/heists')`. Submit button disabled + shows a loading label while in flight (prevents double-submit); a thrown error is caught, shown inline, and does **not** redirect.
  - "Cancel" control (`type="button"`) navigates to `/heists` without writing anything.
- **`components/HeistForm/HeistForm.module.css`** — reuses `app/globals.css` theme tokens the same way `AuthForm.module.css` does (`@reference`, `bg-primary` submit button, `border-lighter` inputs, `text-error` error text).

### 5. Update `app/(dashboard)/heists/create/page.tsx`

Replace the placeholder heading/button with `<HeistForm />` inside the existing `.center-content`/`.page-content` wrapper (same structure `login`/`signup` pages use around `<AuthForm />`).

### 6. Tests: `tests/components/HeistForm.test.tsx`

Mirrors `AuthForm.test.tsx` conventions (mock `@/lib/firebase`, `firebase/auth`, `next/navigation`; add a mock for `firebase/firestore`'s `getDocs`/`addDoc`/`collection`/`serverTimestamp`). Covers the spec's Testing Guidelines: valid submit creates one document with the correct shape; `createdAt`/`deadline` aren't user-editable; assignee list excludes the current user; missing required fields block submission with visible errors before any Firestore call; a write failure keeps the user on the form with an error and does not redirect; rapid double-submit only writes once; success redirects to `/heists`; a user with no codename on record sees the blocked state instead of a form.

## Critical Files

- `lib/firebase.ts` (modified — add `db` export)
- `types/firestore/user.ts` (new)
- `types/firestore/index.ts` (modified — export `user`, add `COLLECTIONS.USERS`)
- `lib/useUsers.ts` (new)
- `components/HeistForm/HeistForm.tsx` (new)
- `components/HeistForm/HeistForm.module.css` (new)
- `components/HeistForm/index.ts` (new)
- `app/(dashboard)/heists/create/page.tsx` (modified)
- `tests/components/HeistForm.test.tsx` (new)

Reused patterns: `components/AuthForm/` (component/folder/module-CSS conventions, controlled-input + submit/loading/error handling shape), `components/HudFrame/` (signature framing), `lib/useRequireAuth.ts` (hook shape), `types/firestore/heist.ts` + the `firestore-schemas` skill (type/converter conventions).

## Verification

1. `npm run lint` and `npx tsc --noEmit` — no errors.
2. `npx vitest run tests/components/HeistForm.test.tsx` — new tests pass.
3. `npm test` — full suite, no regressions.
4. Manual check in the browser: visit `/heists/create` while signed in. Since no `users` documents can exist yet (out-of-scope gap), confirm the "blocked — no codename on record" state renders correctly rather than crashing. If a `users/{uid}` doc is added manually via the Firestore console for testing, confirm the form renders, validates, creates a heist doc with the right shape, and redirects to `/heists`.
