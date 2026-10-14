# admin-permissions design

## Context

Legacy: admin_users_controller permissions_form (HAML view + CSV
variant), grant_permission (POST), revoke_permission (GET — a
state-changing GET), bulk_grant_permission (POST, email list). These are
among the 7 actions already covered by log_admin_action, so audit parity
must be preserved while upgrading to durable rows.

## Goals / Non-Goals

**Goals:**
- Verb hygiene: revoke becomes DELETE (or POST with explicit intent),
  no state change on GET anywhere under /api/admin.
- Bulk grant reports per-email outcomes (granted / not found / already
  had) instead of a flash string.

**Non-Goals:**
- No changes to the permission model or the set of grantable
  permissions.
- No CSV-to-JSON port; export remains a Rails GET.

## Decisions

1. **Endpoints keyed by user id** (resolved via admin-user-lookup
   search), not by raw email at mutation time, except bulk grant which
   accepts the email list as the legacy tool does and resolves
   server-side.

2. **Audit enrichment**: each mutation sets affected_user_id and records
   the permission name in the event params; bulk grant writes one row
   per affected user (matching legacy log_admin_action-per-user
   behavior), not one blob row.

3. **Sudo not required** for permission mutations initially — they are
   reversible. Revisit if review disagrees; the gate is one
   before_action away.

4. **Bulk grant responds 200 with a per-email result array** rather than
   422-on-any-failure, mirroring how the legacy tool partially succeeds.

## Risks / Trade-offs

- [Two write paths during coexistence (HAML form + API)] → both funnel
  through the same model calls; the API adds audit rows the legacy path
  lacks — acceptable asymmetry for the interim, since legacy retains its
  log lines.
- [Bulk operations on long email lists] → same practical limits as the
  legacy form; cap list length server-side.

## Migration Plan

Additive; flip the landing-page link when verified. Legacy revoke GET
persists (linked only from the legacy page) until decommission.

## Open Questions

- Whether granting levelbuilder should require sudo given levelbuilder's
  blast radius — flag for review at implementation time.
