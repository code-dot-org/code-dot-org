# accounts-and-access: page plan

## Blocking questions

1. **Downgrade guard reconciliation.** Code says `can_change_own_user_type?` blocks a teacher who owns non-demo sections server-side (STRONGLY SUPPORTED). My memory says the endpoint accepted it and orphaned a section. The prior note may reference an older code path or `RegistrationsController#update` (which rejects `user_type` in params entirely). Will re-verify against the running app in Phase B.
2. **`simpleSignUp` scope.** Confirmed LTI-only (account linking, upgrade, section sync). Not a general sign-up flow. Resolved.
3. **Inactive-account deletion email.** `InactiveUserPurgeMailer` has no obvious in-repo call site. Is the warning email actually sent? Will grep harder; if ambiguous, omit from user pages and record in evidence.
4. **`frontend/packages/users` production status.** Gated by `frontend_studio_enabled` (default false in production). User-facing pages describe `/users/edit` (legacy) only; note the new module in the developer page.

## Terminology observed in the UI

- Sign-in page heading: "Sign in" (not "Log in")
- Account type chooser: "I'm a student" / "I'm a teacher"
- Section code box label: "Section code" with a "Go" button
- OAuth buttons: "Sign in with Google", "Sign in with Microsoft", "Sign in with Facebook", "Sign in with Clever" (ids: `#google_oauth2-sign-in`, `#microsoft_v2_auth-sign-in`, `#facebook-sign-in`, `#clever-sign-in`)
- Password reset link text: needs browser verification
- Account settings: "Settings" in user menu
- Lockout panel heading: "Just one more thing!"
- The UI says "class" in teacher dashboard, "section" in code/API. Pages will say "class" per UI.

## Student pages

| Path | Type | Goal | Inventory ids | Journey | Screenshot |
|---|---|---|---|---|---|
| `students/account/create-an-account.md` | task | Create a student account | signup-account-type-choice, signup-student, signup-age-gate | create-student-account.spec.ts | no |
| `students/account/sign-in.md` | task | Sign in with email and password | signin-email | sign-in-student.spec.ts | no |
| `students/account/sign-in-with-a-class-code.md` | task | Sign in using picture or word password via a class code | signin-picture-password, signin-word-password | sign-in-class-code.spec.ts | yes (picture grid) |
| `students/account/sign-in-with-google-or-microsoft.md` | task | Use a third-party account to sign in | signin-google, signin-microsoft-facebook, signin-clever | none (BLOCKED: OAuth credentials) | no |
| `students/account/sign-in-from-an-lms.md` | concept | What happens when you open CodeAI from Canvas, Schoology, etc. | signin-lti | none (BLOCKED: LTI credentials) | no |
| `students/account/reset-your-password.md` | task | Get a password reset email | password-reset | reset-password.spec.ts | no |
| `students/account/change-your-settings.md` | task | Change name, email, password, display preferences | account-settings-page, account-email-change, account-ui-preferences | change-settings.spec.ts | no |
| `students/account/link-or-unlink-a-sign-in-method.md` | task | Add or remove Google/Clever/Microsoft login | account-linking-manage | none (BLOCKED: OAuth) | no |
| `students/account/upgrade-to-a-personal-account.md` | task | Add your own email and password to a teacher-created account | account-upgrade-to-personal | none (complex setup) | no |
| `students/account/switch-account-type.md` | task | Change from student to teacher | account-user-type-change | none (verify in browser) | no |
| `students/account/delete-your-account.md` | task | Permanently delete account and work | account-delete | none (destructive) | no |
| `students/account/parent-permission.md` | concept | What the parent permission request is and what happens if nobody responds | cap-parent-permission-request, cap-lockout, under-13-restrictions | none (complex state setup) | no |
| `students/account/terms-and-privacy.md` | concept | Why CodeAI asks you to accept terms | account-terms-of-service, account-cookie-and-consent-banner, account-gdpr-dialog | none | no |
| `students/account/email-preferences.md` | task | Control what emails you get | account-email-preferences | none | no |

### Parent/guardian subsection

| Path | Type | Goal | Inventory ids | Journey | Screenshot |
|---|---|---|---|---|---|
| `students/parents-and-guardians/permission-request.md` | concept | What the permission email is and how to approve | cap-parent-grants-permission, email-parent-messages | none (email link) | no |
| `students/parents-and-guardians/what-teachers-can-see.md` | concept | What information your child's teacher has access to | cap-teacher-visibility | none | no |

## Teacher pages

| Path | Type | Goal | Inventory ids | Journey | Screenshot |
|---|---|---|---|---|---|
| `teachers/account/create-a-teacher-account.md` | task | Create a teacher account | signup-account-type-choice, signup-teacher | create-teacher-account.spec.ts | no |
| `teachers/account/sign-in.md` | task | Sign in as a teacher | signin-email, signin-google, signin-microsoft-facebook, signin-clever | sign-in-teacher.spec.ts | no |
| `teachers/account/change-your-settings.md` | task | Change name, email, password, school | account-settings-page, account-email-change | none | no |
| `teachers/account/switch-account-type.md` | task | Change from teacher to student (and its limits) | account-user-type-change | none (verify in browser) | no |
| `teachers/account/delete-your-account.md` | task | Delete account; what happens to classes | account-delete | none | no |
| `teachers/account/email-preferences.md` | task | Control emails and notifications | account-email-preferences, email-teacher-messages, email-student-unenrolled | none | no |
| `teachers/account/notifications.md` | concept | In-product notifications and announcements | in-product-notifications, announcements | none | no |

## Developer pages

| Path | Type | Goal | Inventory ids | Journey | Screenshot |
|---|---|---|---|---|---|
| `developers/platform/authentication.md` | concept | How auth works: Devise, OmniAuth, session, login types, LTI, CanCanCan | dev-auth-stack, dev-cancancan-layer | none | no |

## Second-level directory names

- `students/account/` -- all account lifecycle tasks for students
- `students/parents-and-guardians/` -- parent/guardian information
- `teachers/account/` -- all account lifecycle tasks for teachers
- `developers/platform/` -- cross-cutting platform concepts (auth lives here)

## Inventory items not documented (with reason)

- `account-purge-and-pii-scrub` -- background job, no user entry point, internal ops only
- `account-inactivity-deletion-warning` -- unclear if the email is sent; will document if confirmed, otherwise omit
- `account-ui-state-flags` -- implementation detail (dismissed banners), no user-facing page
- `race-and-demographics-interstitial` -- optional demographic survey, not an account task
- `safe-browsing-check` -- invisible safety feature, no user action
- `strict-password-policy` -- regional variation, mentioned in create-account page if confirmed
- `sms-send` -- share dialog feature, belongs to projects-and-sharing
- `new-feature-feedback` -- generic feedback mechanism, not account-specific
- `email-pd-workshop` -- professional-learning domain
- `signup-simplified` -- LTI-only, not general sign-up (resolved)

## Cross-domain links assumed

- `teachers/classes/choose-a-login-type.md` (classrooms-and-progress) -- from sign-in-with-a-class-code
- `teachers/classes/print-sign-in-cards.md` (classrooms-and-progress) -- from sign-in-with-a-class-code
- `district-administrators/integration/lms-setup.md` (integrations-schools-districts) -- from sign-in-from-an-lms
- `students/projects/share-a-project.md` (projects-and-sharing) -- from sms-send note
