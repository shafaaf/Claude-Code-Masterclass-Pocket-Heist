---
title: Authentication Forms
slug: authentication-forms
---

## Summary

Implement email and password input forms for the `/login` and `/signup` pages. Both forms should include password visibility toggle and submit buttons. Forms log submitted data to the console and support seamless switching between login and signup modes.

## Figma File Reference

- Link: (none at this time)

## Functional Requirements

- Create reusable form component for both login and signup flows
- Email input field with standard validation attributes
- Password input field with show/hide password toggle via icon button
- Form submit buttons labeled appropriately ("Log in" for login, "Sign up" for signup)
- Console logging of form data on submission (email and password)
- Ability to toggle between login and signup modes without page navigation
- Password icon from lucide-react to control field visibility
- Form fields maintain focus and state during mode switching

## Possible Edge Cases

- User submits form with empty fields (should log as-is, no validation yet)
- User rapidly toggles password visibility
- Form is reset when switching between login and signup modes
- Password field value persists when toggling visibility icon

## Acceptance Criteria

- [ ] `/login` page renders the authentication form in login mode
- [ ] `/signup` page renders the authentication form in signup mode
- [ ] Email and password input fields are functional and accept user input
- [ ] Password toggle icon shows/hides password text correctly
- [ ] Form submission logs email and password to browser console
- [ ] Submit button labels differ between login ("Log in") and signup ("Sign up")
- [ ] Forms can be switched between modes without navigation
- [ ] No validation errors block form submission at this stage

## Open Questions

- Should the form clear input values when switching modes, or preserve them? Preserve
- Should both pages use the same component or separate implementations? Same
- Should the console log include a timestamp or any other metadata? Yes

## Testing Guidelines

- Test email field accepts valid and invalid email formats (no server-side validation yet)
- Test password field toggles between masked and visible states
- Test form submission logs correct data to console
- Test switching between login/signup modes preserves or clears form state as designed
- Test password visibility toggle works reliably with rapid clicks
- Verify submit button labels match the form mode
