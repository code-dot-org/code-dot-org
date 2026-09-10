# 02 — Teenager forgot their password

**Verdict: PARTLY**

## Path taken
- Home page ("CodeAI Documentation") — start
- "Reset your password" (Students > Account, sidebar) — 1 click. Fully answered.

## Answering sentence
"If you forgot your password, you can get a reset link sent to the email address on your account." followed by steps: "Go to studio.code.org/users/password/new. Enter the email address you used when you created your account. Select Reset password." Then: "Check your email for a link from CodeAI. Open the link and choose a new password."

## Confusion points
- The doc does not say what to do if the reset page itself errors. No troubleshooting for "the page is broken." Expected a "contact support" fallback near the top, not buried in the footer.
- No mention of what happens if you are already signed in as someone else (shared/school computer) — the reset URL silently redirected to a teacher dashboard.

## Screenshots
None on the "Reset your password" page. Not strictly needed (text was clear), but a picture of the reset form would have confirmed the persona was on the right page.

## Product test
Did NOT succeed.
- First navigation to /users/password/new redirected to /teacher_dashboard/home — already signed in as a teacher from a prior session. Confusing.
- After signing out, retried /users/password/new and got HTTP 500: "Recaptcha::RecaptchaError at /users/password/new." Reloaded, same error both times.
- Never saw the actual reset-password form.

## Three wishes
1. "If the reset link doesn't load, try again in a minute or contact your teacher/support" — acknowledgment that the page can fail.
2. A screenshot of the actual reset-password form.
3. A note about signing out first if already signed in as someone else.
