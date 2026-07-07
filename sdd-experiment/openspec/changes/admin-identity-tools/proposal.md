# admin-identity-tools

## Why

StudioPerson merge/split and identity impersonation are the
identity-shaped support tools. StudioPerson operations port normally;
assume_identity is the one admin action that cannot become a JSON API —
it swaps the Devise session, invalidating the SPA's resolved auth — so
this change also pins down its documented exception.

## What Changes

- New /api/admin endpoints for StudioPerson: merge two people, split a
  person, add an email. Audited (absorbing the existing Firehose
  studio_person_audit events as a parallel emission, not a replacement);
  merge/split are sudo-gated.
- New SPA StudioPerson page replacing admin_users#studio_person_form and
  its merge/split/add_email POSTs.
- assume_identity: stays a Rails POST with a full-page redirect. The SPA
  gets a launch form (target user + confirmation) that submits a plain
  HTML form POST to the legacy endpoint; audit for it moves from
  log_admin_action-only to an AdminAuditEvent written by the legacy
  action (small Rails-side addition, no API port). Sudo-gated via
  require_sudo! added to the legacy action.
- Legacy HAML forms remain until admin-haml-decommission.

## Capabilities

### New Capabilities

- `admin-studio-person`: audited merge/split/add-email via API + SPA.
- `admin-impersonation`: the assume_identity exception — Rails POST,
  full-page navigation, sudo + durable audit.

### Modified Capabilities

<!-- none -->

## Impact

- dashboard: Api::Admin studio_person controller;
  admin_users_controller#assume_identity gains require_sudo! and an
  AdminAuditEvent write (only legacy action modified in this plan before
  decommission).
- frontend/packages/admin: StudioPerson page; impersonation launch form.
- Depends on: admin-api-foundation, admin-frontend-shell,
  admin-user-lookup.
