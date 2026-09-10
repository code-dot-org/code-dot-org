# Fix wave: students

## Labels corrected (F2)

| Old | New | Page | Source |
|---|---|---|---|
| Select **Join section** | Select **Join** | join-a-section | `join_section.code.submit: 'Join'` (en.yml:127) |
| Select **Reset password** | Select **Submit** | reset-your-password | `password.reset_form.submit: 'Submit'` (en.yml:299) |
| Select **I'm a student** | Select **I'm a Student** | create-an-account | `im_a_student: "I'm a Student"` (signup/en_us.json:4) |

## Answers relocated (F3)

- can-i-share-this: added "anyone with the link can see your project -- they do not need a CodeAI account" in the opening paragraph (was only on sharing-and-publishing).

## Troubleshooting entries added (F5)

- join-a-section: "If you see 'Could not find a section with code...'" -- mistyped code, ask teacher to confirm.
- reset-your-password: "If you are already signed in" -- sign out first on shared computers.
- reset-your-password: "If the reset page shows an error" -- reCAPTCHA failure, reload or contact support.

## Prerequisites added (F7)

- reset-your-password: signed-in state now addressed explicitly before the troubleshooting sections.

## Passages rewritten (F8)

- permission-request: replaced "limits data collection" with enumerated data categories (display name, username, password, hashed email, age, gender) sourced from parent_permission_request.html.haml email template.
- permission-request: replaced vague "The exact restrictions depend on their state's policy" with specific behavior and timeline (7-10 day lockout).

## Naming (F6)

- getting-started/index: added "CodeAI is the new name for Code.org -- your teacher may still call it Code.org."

## Crops (F1)

No new crops. Existing sign-in section code field crop and share dialog crop remain. Per the strict crop rule, no non-lab student page has a control that is genuinely ambiguous (hidden in a menu, icon-only, or one of several similar controls).

## Journeys changed

| Spec | Change | Result |
|---|---|---|
| join-section.spec.ts | Added "join page labels match docs" test asserting `getByRole('button', {name: 'Join'})` (signs in first since /join requires auth) | PASS |
| sign-in-student.spec.ts | Added label assertions for Sign in, Go (exact), Forgot your password? buttons; password reset Submit button asserted conditionally | PASS (5/5) |
| create-student-account.spec.ts | Added `toContainText("I'm a Student")` assertion on student card | PASS |
| student-screenshots.spec.ts | No changes | PASS |
| projects-and-sharing.spec.ts | No changes | PASS (1 pre-existing fixme) |
| hour-of-code.spec.ts | No changes | PASS |

## Grades changed

No grades changed. All pages that were VERIFIED remain VERIFIED (green journeys assert their labels). Pages that were STRONGLY_SUPPORTED remain so (reset-your-password conditional on reCAPTCHA; permission-request no journey possible).

## Final usage

```json
{"session_pct": 18, "week_pct": 73, "tier_pct": 66}
```
