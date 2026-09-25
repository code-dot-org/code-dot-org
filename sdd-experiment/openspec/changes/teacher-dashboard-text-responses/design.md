# Design: teacher-dashboard-text-responses

## Context

Legacy JSX over a small dedicated data module (`textReponsesDataApi.js` —
note the legacy typo in the filename); unit selection shared with the
`unitSelection` redux slice; empty states gated by `ElementOrEmptyPage`
(Router:226-235).

## Goals / Non-Goals

**Goals:** tab at behavior/copy/a11y parity; second consumer of the
per-tab pipeline template (after stats).

**Non-Goals:** no response moderation features; no pixel gate; no rename
of response links' target pages.

## Decisions

- D1. Move-not-rewrite: components move with adapters; the data module's
  fetch moves onto the core transport with request-shape preservation.
- D2. Unit selection: the legacy `unitSelection` slice behavior (which unit
  is shown, default selection) is re-expressed as URL/Query state in the
  candidate, with the legacy slice tests as the oracle — shared with the
  assessments tab (position 9), which uses the same slice; whichever
  implementation lands first owns the shared selector component.

## Risks / Trade-offs

- [Unit-selection semantics shared with assessments diverge if
  re-expressed twice] → one shared unit-selector in the package, built
  here, consumed by assessments.

## Migration Plan

Wrapper → discovery → move → flip map entry → verify. Rollback: revert
additive commits.
