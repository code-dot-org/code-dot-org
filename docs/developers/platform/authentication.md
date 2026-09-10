---
title: Authentication and authorization
description: How Devise, OmniAuth, sessions, section login types, LTI, and CanCanCan compose in the dashboard.
type: concept
---

The dashboard authenticates users through Devise backed by a MySQL `users` table, authorizes actions through CanCanCan, and delegates third-party sign-in to OmniAuth.

## User model and account types

`users.user_type` is the STI column. Two values: `student` and `teacher`. Every row loads as a `Student` or `Teacher` subclass. There is no admin type in this column; `users.admin` is a separate boolean.

## Devise

The `User` model includes these Devise modules:

- `database_authenticatable` -- email/password stored as a bcrypt digest.
- `registerable` -- self-service sign-up at `/users/sign_up`.
- `recoverable` -- password reset via email token.
- `rememberable` -- persistent sign-in cookie.
- `trackable` -- `sign_in_count`, `last_sign_in_at`, etc.
- `lockable` -- locks after repeated failed attempts.
- `timeoutable` -- session expires after inactivity.
- `omniauthable` -- delegates to OmniAuth strategies.
- `invitable` -- teacher invitation flow.

Custom concerns extend the defaults: `ManualSessionExpiration`, `DatabaseAuthenticationOverrides`, `CustomTimeoutable`. Configuration is in `dashboard/config/initializers/devise.rb`.

## Session and cookie

The session cookie is `_learn_session` with `domain: :all`, scoped to `.code.org`. This is how studio and the legacy Pegasus subdomain share a single sign-in.

## OmniAuth providers

Five providers are registered in `devise.rb`:

| Provider | Strategy | Notes |
|---|---|---|
| Google | `:google_oauth2` | Re-prompts consent when requesting extra scopes. |
| Microsoft | `:microsoft_v2_auth` | |
| Facebook | `:facebook` | Graph API v2.12. |
| Clever | `:clever` | IDP-initiated; `provider_ignores_state: true`. |
| ClassLink | `:classlink` | IDP-initiated; custom strategy class. |

Callbacks land in `OmniauthCallbacksController`. The `AuthenticationOption` model stores per-provider credentials linked to a user. A user may have multiple authentication options.

## Section login types

A section's `login_type` determines how students in that section sign in. Six values, defined in `SharedConstants::SECTION_LOGIN_TYPE`:

| Login type | How the student signs in |
|---|---|
| `email` | Email and password on the standard sign-in page. |
| `picture` | Section code, then name, then pick a picture from a grid. |
| `word` | Section code, then name, then type two secret words. |
| `google_classroom` | Google OAuth via roster sync. |
| `clever` | Clever SSO. |
| `lti_v1` | LTI 1.3 launch from an LMS. |

Picture and word sections create teacher-managed student accounts with no personal email or password. The student identity is scoped to the section.

## LTI identity

LTI 1.3 launches arrive at `POST /lti/v1/login` and `POST /lti/v1/authenticate`. The controller validates the launch, creates or links a user via `Services::Lti`, and establishes a Devise session. The LTI identity is stored as an `LtiUserIdentity` record linked to the user and the `LtiIntegration`.

## CanCanCan authorization

All authorization rules live in a single `Ability` class (~638 lines). Key patterns:

- `user.admin?` grants `can :manage, :all` with explicit carve-outs for curriculum models.
- Section-scoped actions check `Section#user_id` (the owning teacher) or `SectionInstructor` membership.
- Student actions check `Follower` membership.
- Fine-grained permissions are stored as `UserPermission` rows. The `permission?` method returns false for any student regardless of what rows exist.

## Staff admin

`users.admin` is a boolean column. An admin must be a teacher-type account, cannot be a student in any section, and (outside dev/adhoc environments) must authenticate via Google OAuth on a `@code.org` email. This is staff access, not a product role.

## User type change guard

`PATCH /users/user_type` checks `can_change_own_user_type?` before proceeding. A teacher who owns non-demo sections is blocked from downgrading to student. The guard is at the controller layer only; no model validation prevents a direct `user_type` assignment.

## Child Account Policy (CAP)

`Policies::ChildAccount` enforces state-level parental consent requirements. A student who is underage, in a covered US state, with a personal account enters a compliance flow: grace period, parent permission request, and lockout if no response arrives by the state deadline. Enforcement hooks live in `ApplicationController` (`GracePeriodHandler`, `LockoutHandler`). The `cap_status` column on `users` tracks the compliance state.
