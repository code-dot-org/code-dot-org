# admin-engineer-console

## Why

The engineering-config editors (DCDO, Gatekeeper, feature_mode,
dynamic_config viewer, NPS) mutate live production behavior and today
have zero audit logging. Routing them through the admin API foundation
closes that hole — the strongest single motivation in the migration —
and is deliberately a separate track from the user-support console per
review.

## What Changes

- New /api/admin config endpoints: read and update DCDO keys, Gatekeeper
  gates (set/delete), feature_mode, dynamic-config read view, and the
  NPS audience setter (DCDO-backed). Every mutation audited; DCDO and
  Gatekeeper updates sudo-gated (highest blast radius in the console).
- New SPA config pages replacing dcdo#show/#update,
  gatekeeper#show/#update/#destroy, feature_mode#show/#update,
  dynamic_config#show, admin_nps#nps_form/#nps_update.
- Legacy HAML pages remain until admin-haml-decommission.

## Capabilities

### New Capabilities

- `admin-config-editing`: audited, sudo-gated DCDO/Gatekeeper/
  feature-mode mutation via API + SPA pages.
- `admin-config-visibility`: read views of dynamic config and current
  gate/key values.

### Modified Capabilities

<!-- none -->

## Impact

- dashboard: Api::Admin config controllers wrapping DCDO/Gatekeeper
  singletons; per-action authorize! calls in the legacy controllers
  unchanged until decommission.
- frontend/packages/admin: config pages (key/value editors with type
  awareness and diff-style confirmation).
- Depends on: admin-api-foundation, admin-frontend-shell. Independent of
  the user-support chunks (parallel track).
