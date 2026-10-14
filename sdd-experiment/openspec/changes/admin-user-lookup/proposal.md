# admin-user-lookup

## Why

The read-only lookup tools (find_students, lookup_section,
lookup_by_email, and the per-user progress/projects/sections inspectors)
are the highest-traffic support tools and the lowest-risk port: pure
GETs, no mutations, no sudo. Porting them first proves the whole
API-foundation + shell stack end to end before anything destructive
moves.

## What Changes

- New JSON endpoints under /api/admin: student search, section lookup
  (by code/id, including deleted), user lookup by email, and per-user
  inspectors for progress, projects, and sections. All inherit
  Api::Admin::BaseController; all read-only (no audit rows by design).
- New SPA pages in @code-dot-org/admin for each tool, replacing
  admin_search#find_students, #lookup_section,
  admin_users#lookup_by_email_form, #user_progress_form,
  #user_projects_form, #user_sections_form.
- Zod schemata + TanStack Query modules for the new endpoints in the
  frontend client layer.
- Legacy HAML pages remain live and linked until admin-haml-decommission.

## Capabilities

### New Capabilities

- `admin-student-search`: find students and users by identifier/email.
- `admin-section-lookup`: section lookup including soft-deleted sections.
- `admin-user-inspectors`: read-only views of a user's progress,
  projects, and sections.

### Modified Capabilities

<!-- none: legacy pages unchanged until decommission -->

## Impact

- dashboard: new controllers under app/controllers/api/admin/; reuses
  existing model queries from admin_search_controller and
  admin_users_controller (extracted, not duplicated).
- frontend/packages/admin: three page groups; client query modules.
- Depends on: admin-api-foundation, admin-frontend-shell.
- Replica note: heavy searches follow the legacy controllers' use of the
  read replica where present.
