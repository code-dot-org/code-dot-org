# admin-user-lifecycle

## Why

The destructive user-support tools — delete/undelete user, undelete
section, delete progress, manual pass, account repair — are exactly the
endpoints the audit table and sudo mode were built for. They port as one
chunk because they share the target-user resolution flow and the
destructive-confirmation UX.

## What Changes

- New /api/admin endpoints: soft-delete user, undelete user, undelete
  section, delete a user's script progress (with reason), manually mark
  a level passed, and account repair (malformed teacher accounts). All
  audited; delete-user, delete-progress, and undelete-user require sudo
  (require_sudo!).
- New SPA pages/flows replacing admin_users#delete_user/#undelete_user,
  admin_search#undelete_section, #delete_progress, #manual_pass,
  #account_repair, with typed-confirmation dialogs for destructive
  actions.
- Legacy HAML forms remain until admin-haml-decommission.

## Capabilities

### New Capabilities

- `admin-user-deletion`: audited, sudo-gated soft delete and undelete of
  users, and section undelete.
- `admin-progress-tools`: delete progress (with reason), manual pass,
  account repair via audited API + SPA flows.

### Modified Capabilities

<!-- none -->

## Impact

- dashboard: Api::Admin controllers wrapping the existing model
  operations used by admin_users_controller / admin_search_controller.
- frontend/packages/admin: destructive-action UX (confirmation pattern
  becomes the package convention).
- Depends on: admin-api-foundation (audit + sudo), admin-frontend-shell,
  admin-user-lookup (target resolution, deleted-section lookup).
