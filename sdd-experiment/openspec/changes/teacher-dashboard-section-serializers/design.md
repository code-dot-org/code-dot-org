# Design: teacher-dashboard-section-serializers

## Context

Three hand-built hashes in `section.rb` (concise / selected / summarize)
serve every section consumer. Overlap fields (id, name, login_type, ...)
are computed independently in each; two merge paths combine them with
opposite precedence (server: concise wins; legacy client bootstrap:
selected wins). No test pins any of it until the shell change's
field-equivalence tests land.

## Goals / Non-Goals

**Goals:** byte-identical extraction; pinned field sets; documented
overlap + merge semantics; thin model delegations.

**Non-Goals:** no field renames/additions/removals; no consolidation of the
three shapes into fewer (that is a product/API decision for later); no
client changes.

## Decisions

- D1. Match the prevailing dashboard serializer idiom (survey
  `dashboard/app/serializers` first; plain PORO with `.call(section)` if no
  strong precedent). Byte-identical output is the acceptance bar —
  serializer output diffed against the legacy method output for a fixture
  matrix (six login types, archived, co-taught, PL, null-curriculum,
  age-gated).
- D2. Tests pin three things separately: each shape's full key set, the
  key overlap between shapes, and the two merge precedences. A divergence
  in an overlapping field becomes a failing test naming both shapes.
- D3. Model methods remain the public API (`concise_summarize` etc.),
  delegating inward. No caller churn, one-commit rollback.

## Risks / Trade-offs

- [Hidden dynamic keys (locale-dependent, DCDO-dependent) break
  byte-equality in tests] → fixture matrix pins locale and flags; dynamic
  values asserted by presence + type where value-pinning is brittle,
  recorded per field.
- [`section.rb` feeds student surfaces] → tests-first ordering (after
  shell) + full dashboard suite as the gate.

## Migration Plan

Extract one shape per commit (concise → selected → summarize), each with
its diff-tests green before the next. Rollback = revert the commit; public
API never moved.

## Open Questions

- Whether `summarize`'s `include_students:` variants warrant two serializer
  entry points or one parameterized — decided at extraction time.
