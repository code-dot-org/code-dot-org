# admin-permissions

## Why

Permission grants (levelbuilder, facilitator, universal_instructor, ...)
are the most consequential non-destructive admin mutations and today ride
HTML forms — including a state-changing revoke implemented as a GET. The
port moves them onto audited JSON endpoints and fixes the verb.

## What Changes

- New /api/admin endpoints: list a user's permissions, grant, revoke
  (proper DELETE/POST, replacing the legacy GET revoke), and bulk grant
  by email list. All mutations audited automatically per
  admin-audit-log.
- New SPA permissions page replacing admin_users#permissions_form,
  grant/revoke/bulk_grant actions.
- Permissions CSV export stays a Rails GET (link from the SPA page), not
  a JSON port.
- Legacy HAML page remains until admin-haml-decommission.

## Capabilities

### New Capabilities

- `admin-permission-management`: view, grant, revoke, and bulk-grant
  user permissions via audited admin API + SPA page.

### Modified Capabilities

<!-- none -->

## Impact

- dashboard: Api::Admin permissions controller; reuses
  UserPermission model paths from admin_users_controller (extracted
  where shared).
- frontend/packages/admin: permissions page + client module.
- Depends on: admin-api-foundation (audit), admin-frontend-shell,
  admin-user-lookup (user resolution + inspector cross-links).
- **BREAKING** (internal-only): legacy GET /admin/revoke_permission is
  superseded; removal happens in admin-haml-decommission.
