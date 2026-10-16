# Proposal: teacher-dashboard-section-serializers

Improvement change (not a parity/migration change). Derived from the
adversarial review of the migration context gathered 2026-07-04.

## Why

`dashboard/app/models/section.rb` hand-builds three overlapping section
hashes — `concise_summarize` (~539), `selected_section_summarize` (~585),
and `summarize`/`summarize_without_students` (~633) — with no serializer
layer and, until the migration changes land, no tests pinning their field
sets. The adversarial pass rates this the single highest-leverage drift
source in the program: `/dashboardapi/section/:id` merges two of the shapes
with one precedence while the legacy client bootstrap merges them with the
opposite precedence, and nothing today would notice an overlapping field
diverging. Every teacher-dashboard consumer (legacy HAML, the new bootstrap
API, the selected-section reload) reads these hashes.

Sequenced deliberately AFTER `teacher-dashboard-shell`: its
field-equivalence tests are the safety net that makes this refactor honest.
`section.rb` also feeds student-facing surfaces, so tests-first ordering is
mandatory, not stylistic.

## What Changes

- Extract the three hashes into named, tested serializers (plain objects or
  the codebase's prevailing serializer idiom — decided in design after a
  survey of `dashboard/app/serializers`), preserving output byte-for-byte.
- Add serializer unit tests that pin each shape's full field set, the
  overlap set, and the merge behavior of
  `selected_section_summarize.merge(concise_summarize)` used by
  `ApiController#section`.
- `Section` model methods become thin delegations to the serializers (no
  caller changes anywhere).
- Document the three shapes and their consumers in one place (serializer
  docs), replacing tribal knowledge.

## Capabilities

### New Capabilities

- `section-serialization-contract`: named serializers with pinned field
  sets and merge-precedence tests for the three section shapes.

### Modified Capabilities

None — output is byte-identical; no consumer-facing requirement changes.

## Impact

- `dashboard/app/models/section.rb`, new serializer files + tests.
- Zero intended behavior change; the shell's field-equivalence tests and
  the full dashboard test suite are the regression gates.
- De-risks every subsequent tab migration and any future section API work.
