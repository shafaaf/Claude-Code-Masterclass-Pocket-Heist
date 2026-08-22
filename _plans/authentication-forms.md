# Authentication Forms — Implementation Plan

## Context

Pocket Heist's `/login` and `/signup` pages are currently unstyled placeholder stubs (headings only). Per `_specs/authentication-forms.md`, we need real, interactive auth forms: email + password fields, a password show/hide toggle, a submit button, and the ability to switch between login and signup modes without page navigation. There's no real backend yet, so on submit the form only `console.log`s the entered data (with a timestamp). This is the first interactive/stateful UI in the project — no forms, `useState`, or client components exist anywhere in the codebase yet, so this work also establishes the pattern for future interactive components.

Spec answers already locked in: field values **persist** when switching modes, both pages share **one** component, and the console log includes a **timestamp**. Confirmed with the user: submitted fields stay filled after submit (no reset, since it's a stub), and the submit button is **full-width**.

## Approach

### 1. New component: `components/AuthForm/`

Follows the existing `Navbar` folder convention (`Navbar.tsx` + `Navbar.module.css` + `index.ts` barrel).

- **`components/AuthForm/index.ts`** — barrel re-export: `export { default } from "./AuthForm"` plus `export type { AuthMode } from "./AuthForm"`.
- **`components/AuthForm/AuthForm.tsx`** — first `'use client'` component in the repo.
  - Props: `interface AuthFormProps { initialMode?: AuthMode }` where `type AuthMode = "login" | "signup"` (defaults to `"login"`).
  - State: `mode`, `email`, `password`, `showPassword` via plain `useState` (no form libraries are installed — build with controlled inputs).
  - Mode-driven copy (heading, submit label, switch-prompt text) pulled from a small lookup object keyed by `AuthMode`, so JSX stays declarative.
  - `useId()` to generate unique ids for the email/password `<label htmlFor>`/`<input id>` pairs.
  - Submit handler: `e.preventDefault()` then `console.log({ mode, email, password, timestamp: new Date().toISOString() })`. Fields are **not** cleared afterward.
  - Switch-mode handler flips `mode` only — never touches `email`/`password`, which is what preserves typed values across the switch.
  - `<form noValidate>` and inputs with **no** `required`/`pattern` attributes — this guarantees native browser validation never blocks submission, per the spec's acceptance criterion. `type="email"` is kept on the email input purely for semantics/mobile keyboards.
  - Password toggle: `Eye`/`EyeOff` icons from `lucide-react` (same import style as `Navbar`'s `Clock8`), rendered inside an icon-only `<button type="button">` with `aria-label` toggling between "Show password"/"Hide password", and `aria-hidden="true"` on the icon itself.
  - Switch-mode control is also `type="button"` with a distinct `aria-label` (e.g. "Switch to sign up mode") so it's unambiguous for screen readers and doesn't collide with the submit button's label.
  - Submit button is explicit `type="submit"`.
- **`components/AuthForm/AuthForm.module.css`** — starts with `@reference "../../app/globals.css";` (matching `Navbar.module.css`), then `@apply`s existing `@theme` tokens for: form layout (flex column, gap, max-width, centered), field/label spacing, input styling (border, `bg-light`, `text-heading`, focus ring using `bg-primary`/`ring-primary`), a `.passwordWrapper` for relative positioning of the toggle icon, a full-width `.submitButton` (`bg-primary`, `hover:bg-secondary`, mirroring `.btn-danger`'s transition/radius pattern but full-width per confirmed decision), and a text-button style for the switch-mode link.

### 2. Update pages to use the shared component

- **`app/(public)/login/page.tsx`** — fix the mis-named `SignupPage` function (should be `LoginPage`), replace the static heading with `<AuthForm initialMode="login" />`, keep the existing `.center-content`/`.page-content` wrapper divs.
- **`app/(public)/signup/page.tsx`** — same pattern with `<AuthForm initialMode="signup" />`.
- Both pages remain server components; only `AuthForm` itself needs `'use client'`. The dynamic heading (previously a static `<h2 className="form-title">` per page) moves inside `AuthForm` so it stays in sync when the user toggles modes in place.

### 3. Tests: `tests/components/AuthForm.test.tsx`

Mirrors `tests/components/Navbar.test.tsx` conventions (`render`/`screen` from `@testing-library/react`, `describe/it/expect` from `vitest`, role/label-based queries, `@/components/AuthForm` barrel import), adding `@testing-library/user-event` (already a dev dependency, not yet used elsewhere) for realistic interaction simulation. Planned cases:

1. Default (login) mode renders correct heading + "Log in" submit button.
2. `initialMode="signup"` renders correct heading + "Sign up" submit button.
3. Typing into email/password fields updates their values.
4. Password toggle switches input `type` between `password`/`text` and updates its `aria-label`; verify it survives rapid repeated clicks.
5. Switching modes preserves already-typed email/password values while updating heading/submit copy.
6. Submitting in login mode calls `console.log` (spied via `vi.spyOn`) with an object containing `mode: "login"`, the typed email/password, and a valid ISO `timestamp`.
7. Submitting after switching to signup mode logs `mode: "signup"` with the correct data.
8. Submitting with empty fields still fires `console.log` (proves `noValidate` — nothing blocks submission), matching the spec's "no validation yet" edge case.

## Critical Files

- `components/AuthForm/AuthForm.tsx` (new)
- `components/AuthForm/AuthForm.module.css` (new)
- `components/AuthForm/index.ts` (new)
- `app/(public)/login/page.tsx` (modified)
- `app/(public)/signup/page.tsx` (modified)
- `tests/components/AuthForm.test.tsx` (new)

Reference/reused patterns:

- `components/Navbar/` — folder/CSS-module/barrel conventions to replicate
- `app/globals.css` — `@theme` tokens and shared classes (`.page-content`, `.center-content`, `.form-title`) to reuse rather than redefine

## Verification

1. `npm run lint` — confirm no ESLint errors (flat config, eslint-config-next).
2. `npx tsc --noEmit` — confirm no type errors (no dedicated typecheck script exists).
3. `npx vitest run tests/components/AuthForm.test.tsx` — confirm all new tests pass.
4. `npm test` — run the full suite to confirm no regressions (e.g. `Navbar.test.tsx` still passes).
5. `npm run dev` and manually visit `/login` and `/signup`:
   - Confirm email/password fields accept input and the password toggle icon shows/hides the password text.
   - Confirm clicking "Sign up"/"Log in" switch-mode link toggles the form in place (no navigation, URL unchanged) and preserves already-typed values.
   - Open the browser console, submit the form, and confirm the logged object contains `mode`, `email`, `password`, and `timestamp`.
   - Confirm submitting with empty fields is not blocked by the browser (no native validation popup).
