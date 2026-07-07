# admin-engineer-console design

## Context

dcdo_controller, gatekeeper_controller, feature_mode_controller, and
dynamic_config_controller guard per-action with `authorize! :read,
:reports` and render HAML editors over the DCDO/Gatekeeper dynamic-config
stores. admin_nps writes an NPS audience through DCDO. None of these log
anything on mutation: a changed gate or DCDO key is currently
unattributable. DCDO keys are typed values (JSON-ish); Gatekeeper gates
are feature switches with optional where-clauses.

## Goals / Non-Goals

**Goals:**
- Attribution: every config mutation carries actor + before/after values
  in its audit row.
- Foot-gun reduction: diff-style confirmation (old value → new value)
  before any write.

**Non-Goals:**
- No changes to DCDO/Gatekeeper storage or propagation semantics.
- No config schema/typing layer beyond what the stores expose.
- No approval workflow (two-person rule) — flagged as a possible later
  change, not this one.

## Decisions

1. **Sudo on DCDO and Gatekeeper writes** (production behavior switches;
   a hijacked admin session flipping gates is the nightmare scenario).
   feature_mode and NPS follow the same gate for uniformity — everything
   on this console mutates prod behavior.

2. **Before/after values in the audit event params** (old value, new
   value, key/gate name). Config mutations are where value-level audit
   pays for itself; the sanitizer blocklist still applies in case a
   secret is ever stuffed into a key.

3. **Read views are plain GETs** returning current values (no audit
   rows), replacing dynamic_config#show and the editors' show halves.

4. **The SPA editor is deliberately conservative**: raw value editing
   with client-side JSON validation and a mandatory old→new diff
   confirmation. No cleverness (no typed form generation) in v1 —
   parity plus confirmation.

## Risks / Trade-offs

- [Two mutation paths during coexistence, one audited] → same interim
  asymmetry as other chunks, but riskier here; mitigate by flipping
  landing links early and socializing "use the SPA editor" internally
  once verified.
- [Sudo friction for incident response (flip a gate NOW)] → the window
  is DCDO-tunable, and the legacy page remains as the break-glass path
  until decommission; decommission timing for this console should weigh
  incident ergonomics.
- [Value-level audit of large DCDO blobs] → cap stored value size in
  the event params; truncated values flagged as such.

## Migration Plan

Additive; flip links after side-by-side verification on a non-prod
environment (config mutation testing does not belong on prod). Legacy
editors retire in admin-haml-decommission, with the break-glass
consideration above.

## Open Questions

- Should gate/key deletion require a second confirmation step beyond
  sudo (type the key name)? Default yes in the SPA, cheap to include.
