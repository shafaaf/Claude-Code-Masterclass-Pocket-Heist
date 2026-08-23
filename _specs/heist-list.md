---
title: Heist List
slug: heist-list
---

## Summary

The `/heists` page currently shows three static placeholder headings ("Your Active Heists", "Heists You've Assigned", "All Expired Heists") with no actual content underneath. This feature replaces that placeholder with a real, flat list of every heist in the `heists` Firestore collection — visible to any signed-in user, not filtered to their own heists — so the app finally shows the heists that have been created.

## Figma File Reference

- Link: (none at this time)

## Functional Requirements

- `/heists` displays every document in the `heists` collection as a card, in one flat list (no grouping by "yours"/"assigned by you"/"expired" for now — that replaces the three current placeholder headings).
- Each card shows: title, description, who it's assigned to (their codename), and status.
- Status is shown as one of exactly three values, taken directly from the heist's `finalStatus` field: Active (`finalStatus` is `null`), Success, or Failure. No separate "expired" state is computed for this feature.
- The list is visible to any signed-in user — it is not filtered to heists the current user created or was assigned.
- Heists are ordered newest-created first.
- An empty collection (no heists exist yet) shows a clear "no heists yet" message instead of an empty blank area.
- Loading and error states are handled — the page doesn't show a blank screen while heists are being fetched, and a fetch failure is communicated rather than silently showing nothing.

## Possible Edge Cases

- No heists exist yet in the collection.
- A heist's `assignedToCodename` is present on the heist document itself (already stored at creation time, per the Create Heist form), so this doesn't require a separate lookup against the `users` collection — but confirm the card only ever needs data already on the heist document, not a live join.
- Fetching the heist list fails (e.g. offline) — the page should communicate this rather than appearing empty.
- A very long title or description shouldn't break the card's layout.

## Acceptance Criteria

- [ ] Visiting `/heists` while signed in shows a card for every document in the `heists` collection.
- [ ] Each card shows title, description, assignee codename, and status (Active/Success/Failure).
- [ ] The list is not filtered by the signed-in user — everyone sees the same full list.
- [ ] Heists are ordered newest-first.
- [ ] An empty `heists` collection shows a clear empty-state message, not a blank area.
- [ ] A failed fetch shows an error message rather than an empty or blank list.
- [ ] The three old placeholder headings ("Your Active Heists", "Heists You've Assigned", "All Expired Heists") are removed/replaced by this list.

## Open Questions

None outstanding. The full `heists` collection is fetched at once with no cap or pagination, matching the app's current scale and the precedent set by the users roster fetch — revisit pagination later if the collection actually grows large.

## Testing Guidelines

- Test that a page with multiple heists renders a card per heist, with the correct title, description, assignee codename, and status for each.
- Test that heists are rendered newest-first.
- Test that an empty heist collection shows the empty-state message instead of any cards.
- Test that a fetch failure shows an error message.
- Test that all three status values (Active, Success, Failure) render correctly based on `finalStatus`.
