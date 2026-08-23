---
title: First-Time Codename Prompt
slug: first-time-codename-prompt
---

## Summary

Right now, nothing in the app ever creates a `users` Firestore document or a codename for anyone — signup only creates a Firebase Auth account. This blocks any feature that needs a codename (e.g. the Create Heist form currently just shows a dead-end message). This feature closes that gap generally: whenever a signed-in user without a codename on record reaches a spot in the app that needs one, they're prompted to set one, right there, so codenames get captured organically as people use the app rather than through a dedicated signup step.

## Figma File Reference

- Link: (none at this time)

## Functional Requirements

- A reusable way to check whether the signed-in user has a `users/{uid}` document with a `codename` field, usable from any page or feature that needs a codename — not hardcoded into a single page.
- When a signed-in user without a codename reaches such a spot, they see a prompt to choose a codename instead of (or in front of) whatever they were trying to do.
- Submitting a valid codename writes a new `users/{uid}` Firestore document containing it.
- Once a codename is set, it is permanent — there is no rename/edit capability, now or implied later.
- After successfully setting a codename, the user proceeds to whatever they were originally trying to do, without needing to re-navigate or resubmit anything else.
- A codename must be non-empty; trivial validation (not blank/whitespace-only) blocks submission with a clear message.
- A codename must be unique across all users. Submitting one that's already taken is blocked with a clear inline error, checked at submit time (not perfectly race-proof — two people submitting the exact same codename at the same instant could both pass the check — but not worth building atomic locking for a first pass).
- A user who already has a codename never sees this prompt again, anywhere in the app.
- The check lives at the point of use (currently: the Create Heist form) rather than centrally in the dashboard layout, but is built as a reusable piece so any future feature needing a codename can adopt it without duplicating this logic.

## Possible Edge Cases

- A `users/{uid}` document exists but its `codename` field is missing or empty (partial/corrupt data) — should be treated the same as "no codename yet," not crash.
- User submits an empty or whitespace-only codename.
- The Firestore write to create the `users/{uid}` document fails (e.g. offline) — the user should see an error and remain able to retry, not be silently let through as if they now have a codename.
- Two browser tabs open for the same signed-in user: one sets a codename while the other is also mid-prompt.
- User submits a codename that's already taken by another user.
- Two users submit the same not-yet-taken codename at nearly the same instant (accepted race-condition risk, not solved by this feature).
- A user is prompted, sets a codename, then immediately needs to use a feature elsewhere in the app that also checks for a codename — the second spot should recognize the codename now exists and not prompt again.

## Acceptance Criteria

- [ ] A signed-in user with no `users/{uid}` document (or one with a missing/empty `codename`) is prompted to set a codename the first time they reach a spot in the app that needs one.
- [ ] The prompt is reusable — implemented so any current or future page/feature needing a codename can rely on the same check, not duplicated per page.
- [ ] Submitting a valid codename creates a `users/{uid}` Firestore document containing it.
- [ ] Submitting an empty/whitespace-only codename is blocked with a clear inline error; no Firestore write is attempted.
- [ ] After successfully setting a codename, the user's original action/destination resumes automatically.
- [ ] A user who already has a codename on record is never shown the prompt.
- [ ] A failed Firestore write while setting a codename shows an error and does not proceed as if it succeeded.
- [ ] The existing Create Heist form's current "you need a codename on file" dead-end message is replaced by this prompt, so a user can now actually get unblocked and create a heist in one flow.
- [ ] Submitting a codename already taken by another user is blocked with a clear inline error; no Firestore write is attempted.

## Open Questions

None outstanding. Format/length constraints: none for now — any non-empty, not-already-taken text is acceptable, matching the precedent set for title/description in the Create Heist form.

## Testing Guidelines

- Test that a signed-in user with no `users/{uid}` document sees the prompt at the relevant spot(s).
- Test that a signed-in user with a `users/{uid}` document containing a valid codename never sees the prompt.
- Test that a `users/{uid}` document with a missing/empty codename is treated as "no codename" and triggers the prompt.
- Test that submitting a valid codename writes the expected Firestore document shape.
- Test that submitting an empty/whitespace-only codename is blocked with an inline error and does not write to Firestore.
- Test that a failed Firestore write surfaces an error and does not treat the user as if they now have a codename.
- Test that after successfully setting a codename, the user's original destination/action resumes (e.g. the Create Heist form becomes usable immediately after).
- Test that submitting a codename already taken by another user is blocked with an inline error and does not write to Firestore.
