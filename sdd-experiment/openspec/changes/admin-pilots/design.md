# admin-pilots design

## Context

admin_pilots_controller implements index/create/show plus
add_to_pilot/remove_from_pilot POSTs keyed by pilot name and teacher
emails. It is the simplest legacy admin controller and already leans
JSON-ish on errors. No log_admin_action coverage today.

## Goals / Non-Goals

**Goals:**
- Straight port with audit added; RESTful shapes
  (/api/admin/pilots, /api/admin/pilots/:name/users).

**Non-Goals:**
- No pilot model changes, no rename/delete-pilot capability beyond
  legacy parity.

## Decisions

1. **Keyed by pilot name** as legacy does (names are the de facto ids in
   DCDO-adjacent tooling); URL-encoded path segment.
2. **Enrollment add accepts an email list** returning per-email outcomes
   (found+added / not found / already enrolled), same contract shape as
   admin-permissions bulk grant so the SPA component is shared.
3. **Audit**: one row per enrollment change with affected_user_id;
   pilot name in params.

## Risks / Trade-offs

- [Pilot names with URL-hostile characters] → encode in the client,
  constraint-test in Rails routing; legacy pages already cope with these
  names.

## Migration Plan

Additive; flip landing links when verified; legacy retires in
admin-haml-decommission.

## Open Questions

- None.
