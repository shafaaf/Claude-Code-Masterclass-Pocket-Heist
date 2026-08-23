---
title: Create Heist Form
slug: create-heist-form
---

## Summary

Wire up the "Create Heist" form at `/heists/create` so it actually creates a heist. Today the page is a static placeholder (a heading and a button with no handler). This feature turns it into a working form that lets a signed-in user pick a title, description, and target coworker for a heist, submits a new document to the `heists` Firestore collection, and returns the user to `/heists` once the heist is created.

## Figma File Reference

- Link: (none at this time)

## Functional Requirements

- Form fields cover every user-editable field of `CreateHeistInput`: `title`, `description`, `assignedTo`, `assignedToCodename`.
  - `createdBy` / `createdByCodename` are derived from the currently signed-in user, not entered by hand.
  - `createdAt` is set programmatically as a Firestore server timestamp, not user input.
  - `deadline` is computed programmatically as 48 hours from the server-committed `createdAt` time (not the user's local clock) — it is not a field the user fills in.
  - `finalStatus` is always `null` on creation, not user input.
- A dedicated `User` Firestore type (document shape, create input, converter) is defined as part of this feature, following the same pattern as `types/firestore/heist.ts`, since none exists yet.
- "Assign to" is a picker (not free text) populated from the `users` collection, so the submitter can only assign a heist to a real, existing user.
  - Each option shows the target's codename; selecting one records both their user ID (`assignedTo`) and codename (`assignedToCodename`) on the heist.
  - The current user should not be able to assign a heist to themselves.
  - A codename is fixed at signup and does not change later, so the assignee list can be fetched once rather than kept live.
- If the signed-in user has no codename on record, heist creation is blocked entirely (not just given a fallback value) until they have one — see Open Questions for why this needs a decision before implementation.
- Title and description are required (non-empty) but have no length or character restrictions for now.
- A "Cancel" control returns the user to `/heists` without creating anything.
- On submit:
  1. Validate that required fields are present (title, description, an assigned target).
  2. Create a new document in the `heists` collection via the existing `CreateHeistInput` shape.
  3. On success, redirect to `/heists`.
- On failure (e.g. Firestore write error, network issue), the user stays on the form and sees an error message; no partial/duplicate heist is created.
- While the submission is in flight, the submit button shows a loading state and is disabled to prevent duplicate submissions.
- The form is only reachable by a signed-in user (already enforced by the `(dashboard)` route guard); the signed-in user's ID and codename are what populate `createdBy` / `createdByCodename`.

## Possible Edge Cases

- The `users` collection is empty or fails to load — the assignee picker should communicate this rather than silently showing nothing.
- The signed-in user has no codename on record — heist creation is blocked with a clear message telling them why (see Open Questions: this may currently be unavoidable for every user, since nothing in the app creates codenames yet).
- User submits with no assignee selected — form should block submission with a clear error, not create a heist with a missing/empty `assignedTo`.
- User double-clicks submit, or submits, waits, and submits again before the redirect completes — must not create two heist documents for one submission.
- Title or description is empty or only whitespace.
- Firestore write fails partway (e.g. offline) — the user should not be silently redirected to `/heists` as if it succeeded.
- The signed-in user's own account is missing from, or not yet synced to, the `users` collection.

## Acceptance Criteria

- [ ] `/heists/create` renders a form with fields for title, description, and an assignee picker sourced from the `users` collection.
- [ ] The assignee picker lists other users by codename and excludes the current user.
- [ ] Submitting a valid form creates a new document in the `heists` Firestore collection matching the `CreateHeistInput` shape.
- [ ] `createdAt` and `deadline` are set programmatically on submission (deadline = 48 hours from creation) and are never user-editable inputs.
- [ ] `createdBy` and `createdByCodename` are populated from the signed-in user, not from form input.
- [ ] `finalStatus` is stored as `null` on creation.
- [ ] On successful creation, the user is redirected to `/heists`.
- [ ] On a failed submission, the user remains on `/heists/create` and sees an error message; no heist document is created.
- [ ] The submit control is disabled/shows a loading state while the request is in flight, and cannot be triggered twice for one submission.
- [ ] Submitting with missing required fields (title, description, or assignee) is blocked with a clear inline error before any Firestore write is attempted.
- [ ] A `User` Firestore type/converter exists at `types/firestore/user.ts`, following the pattern in `types/firestore/heist.ts`.
- [ ] A user with no codename on record cannot create a heist, and sees a clear explanation why.
- [ ] A "Cancel" control returns to `/heists` without creating a heist document.

## Open Questions

None outstanding. See the Dependencies note below for a known gap that is explicitly out of scope for this feature.

## Dependencies

- **Prerequisite (out of scope here):** nothing in this codebase currently creates a `users` Firestore document or a codename for anyone — signup (`components/AuthForm/AuthForm.tsx`) only calls Firebase Auth and never writes to Firestore. Confirmed via full-repo search: no seed scripts, no cloud functions, nothing populates `users`. This feature assumes that gap is closed separately (a future "capture codename at signup" feature); it only builds the Create Heist form itself, reading from `users` as if it were already populated. Until that prerequisite ships, the `users` collection will be empty, no one will have a codename, and the "block creation until you have a codename" rule in this spec will block everyone — that is expected and correct behavior for this feature in isolation.
- A Firestore `db` instance needs to be added to `lib/firebase.ts` as part of this feature's implementation — none exists yet (only Firebase Auth is set up there).

## Testing Guidelines

- Test that submitting a fully valid form creates exactly one Firestore document with the correct shape (all `CreateHeistInput` fields present, `finalStatus: null`).
- Test that `createdAt` and `deadline` are never derived from user-editable form fields.
- Test that the assignee picker excludes the signed-in user and is populated from the `users` collection.
- Test that submission is blocked, with a visible error, when title, description, or assignee is missing.
- Test that a Firestore write failure leaves the user on the form with an error, and does not redirect to `/heists`.
- Test that rapid repeated submit clicks do not create multiple heist documents.
- Test that a successful submission redirects to `/heists`.
