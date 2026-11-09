# admin-pilots

## Why

Pilot management (create pilots, enroll/remove teachers by email) is a
small, self-contained tool — a good mid-sequence chunk that exercises
the list/detail + bulk-email patterns established by earlier chunks
without any sudo complexity.

## What Changes

- New /api/admin endpoints: list pilots, create pilot, pilot detail
  (enrolled users), add users by email list, remove user. Mutations
  audited; no sudo (enrollment is reversible).
- New SPA pilots pages replacing admin_pilots#index/#create/#show,
  #add_to_pilot, #remove_from_pilot.
- Legacy HAML pages remain until admin-haml-decommission.

## Capabilities

### New Capabilities

- `admin-pilot-management`: pilot CRUD and enrollment via audited API +
  SPA pages.

### Modified Capabilities

<!-- none -->

## Impact

- dashboard: Api::Admin pilots controller wrapping the model paths of
  admin_pilots_controller (which already returns JSON errors inline in
  places).
- frontend/packages/admin: pilots list/detail pages; reuses the
  per-email outcome rendering from admin-permissions bulk grant.
- Depends on: admin-api-foundation, admin-frontend-shell; benefits from
  admin-permissions' bulk-email pattern.
