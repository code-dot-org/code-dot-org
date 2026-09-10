---
title: Staff tools
description: Admin account lookup, impersonation, permission grants, moderation, reports, and NPS management.
type: reference
---

**Applies to:** internal CodeAI staff only. All tools under `/admin/` require the `admin` flag on the user account (`users.admin` boolean column). Some moderation and evaluation tools require specific `UserPermission` values instead.

## Account lookup and repair

All routes below require `admin`.

| Route | Purpose |
|---|---|
| `/admin/lookup_by_email` | Look up a user by email address. |
| `/admin/find_students` | Search for student accounts. |
| `/admin/account_repair` | Repair account state (authentication options, email conflicts). |
| `/admin/studio_person` | Merge or split StudioPerson records (the cross-authentication identity). |
| `/admin/manual_pass` | Manually mark a user as passing a level. |
| `/admin/delete_user` | Soft-delete a user account. |
| `/admin/undelete_user` | Restore a soft-deleted account. |

## Impersonation

| Route | Purpose |
|---|---|
| `/admin/assume_identity` | Sign in as another user for support. Your admin session is preserved; ending the impersonation returns you to your own account. |

Requires `admin`.

## Permission grants

| Route | Purpose |
|---|---|
| `/admin/permissions` | View and manage user permissions. |
| `POST /admin/grant_permission` | Grant a single permission to a user. |
| `POST /admin/revoke_permission` (GET) | Revoke a permission. |
| `POST /admin/bulk_grant_permission` | Grant a permission to multiple users at once. |
| `/admin/permissions/csv` | Export all permission grants as CSV. |

Requires `admin`. Every grant is logged to the `#infra-security` Slack channel, except AUTHORIZED_TEACHER grants.

The valid permissions are: FACILITATOR, LEVELBUILDER, PROJECT_VALIDATOR, WORKSHOP_ADMIN, WORKSHOP_ORGANIZER, PLC_REVIEWER, AUTHORIZED_TEACHER, PROGRAM_MANAGER, UNIVERSAL_INSTRUCTOR, STUDENT_WORK_ACCESS. Only teacher-type accounts can hold permissions.

## Section and progress tools

All require `admin`.

| Route | Purpose |
|---|---|
| `/admin/lookup_section` | Look up a section by ID or code. |
| `/admin/undelete_section` | Restore a deleted section. |
| `/admin/user_progress` | Inspect a user's level-by-level progress. |
| `/admin/user_sections` | Inspect a user's section memberships. |
| `/admin/user_projects` | Inspect a user's projects. |
| `/admin/user_project_restore` | Restore a deleted project. |
| `/admin/delete_progress` | Delete a user's progress on a script. |
| `/admin/mass-delete-student-progress` | Bulk-delete student progress. |

## Reports

Require `admin` (implemented as `authorize! :read, :reports` through CanCanCan).

| Route | Purpose |
|---|---|
| `/admin/` | Admin directory and dashboard. |
| `/admin/levels` | Level completion counts. |
| `/admin/level_answers` | Answer distribution for a level. |
| `/admin/debug` | Debug information for a request. |

## Featured project curation

Requires `UserPermission` PROJECT_VALIDATOR (not `admin`).

| Route | Purpose |
|---|---|
| `/projects/featured` | View the featured project queue. |
| `POST /featured_projects/:id/feature` | Feature a project in the public gallery. |
| `POST /featured_projects/:id/unfeature` | Remove a project from the featured gallery. |
| `POST /featured_projects/:id/bookmark` | Bookmark a project for later review. |

## Abuse moderation

Requires PROJECT_VALIDATOR.

| Route | Purpose |
|---|---|
| `DELETE /v3/channels/:channel_id/abuse` | Reset a project's abuse score to zero. |
| `POST /v3/channels/:channel_id/abuse/delete` | Block a project share. |

## Student work evaluation samples

Requires `UserPermission` STUDENT_WORK_ACCESS.

| Route | Purpose |
|---|---|
| `POST /student_work_evaluations` | Pull AI-evaluated samples of student work. |
| `GET /student_work_evaluations/:user_id/:level_id/:unit_id` | View evaluations for a specific student, level, and unit. |

## NPS survey

Requires `admin`. The NPS audience is further gated by the DCDO key `nps_audience`.

| Route | Purpose |
|---|---|
| `/admin/nps/nps_form` | View and configure the NPS survey. |
| `POST /admin/nps/nps_update` | Update NPS survey settings. |

## Pilots

Requires `admin`.

| Route | Purpose |
|---|---|
| `/admin/pilots` | List active pilots. |
| `POST /admin/pilots` | Create a pilot. |
| `/admin/pilots/:pilot_name` | View a pilot. |
| `POST /admin/pilots/add_to_pilot` | Add a user or section to a pilot. |
| `POST /admin/pilots/remove_from_pilot` | Remove from a pilot. |

For the flag consoles (DCDO, Gatekeeper, feature mode, dynamic config), see [Availability and configuration](/developers/platform/availability-and-configuration/).

## The `admin` flag

`admin` is a boolean column on the `users` table. An admin must be a teacher-type account with no student enrollments. Outside development and adhoc environments, an admin must authenticate solely via Google OAuth on a `@code.org` email. In the CanCanCan `Ability` model, `admin?` grants `can :manage, :all` with an explicit carve-out for curriculum models (those require `levelbuilder?` and levelbuilder mode).

## Next steps

- [Availability and configuration](/developers/platform/availability-and-configuration/) -- DCDO, Gatekeeper, and the flag consoles.
- [Authentication and authorization](/developers/platform/authentication/) -- Devise, CanCanCan, and the session model.
