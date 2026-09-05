# Spec: section-serialization-contract

## ADDED Requirements

### Requirement: Named serializers with byte-identical output
The three section shapes SHALL be produced by named, tested serializers,
with `Section#concise_summarize`, `Section#selected_section_summarize`, and
`Section#summarize`/`summarize_without_students` delegating to them and
returning byte-identical output to the pre-change methods for a fixture
matrix covering the six login types, archived, co-taught, PL,
null-curriculum, and age-gated sections.

#### Scenario: Extraction is invisible to consumers
- **WHEN** the serializer output is diffed against the legacy method output
  for every fixture section
- **THEN** the diff is empty, and all existing dashboard tests (including
  the shell change's field-equivalence tests) pass unchanged

### Requirement: Field sets and merge precedence are pinned
Serializer tests SHALL pin, as explicit expectations: each shape's complete
key set; the key overlap between shapes; and the result of
`selected.merge(concise)` (the `/dashboardapi/section/:id` path) versus
`{**concise, **selected}` (the legacy client bootstrap path) for the
overlap keys.

#### Scenario: Overlap divergence is loud
- **WHEN** a change makes an overlapping field's value differ between two
  shapes
- **THEN** a serializer test fails naming the field and both shapes, before
  any client can observe merge-order-dependent behavior
