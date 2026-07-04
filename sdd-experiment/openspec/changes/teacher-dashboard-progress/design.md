# Design: teacher-dashboard-progress

## Context

`sectionProgressV2/` is the largest tab tree: grid columns
(lesson/expanded/level data cells), floating header + floating scrollbar,
teacher panel, lesson lock dialog, view-as, more-details dialog, CSV
download, skeleton loading columns. Three slices interlock:
`progressRedux` (also used by overviews), `sectionProgress` (grid data,
paginated loads), `unitSelection`. GE wrapper hides the component per
region. 24 jest files are the behavior oracle;
`teacher_dashboard_progress_v2.feature` carries e2e incl. @eyes scenarios.

## Goals / Non-Goals

**Goals:** full progress parity in three sub-splits; the last core tab off
the legacy shell.

**Non-Goals:** no pixel gate (legacy JSX; the @eyes scenarios' assertions
port as behavior/structural checks, not pixel diffs); no grid redesign; no
new progress metrics.

## Decisions

- D1. Sub-splits are ordered, independently landable slices behind the
  same route: read-only grid first (proves data volume + selector), then
  floating chrome (pure UI, riskiest for subtle behavior), then
  interactive surfaces (panel, lock, scores, view-as, dialog). Each slice
  has its own scenario subset and verification.
- D2. State: reuse the overview change's scoped store module for
  progressRedux; move `sectionProgress` + `unitSelection` into the same
  module here. The unitSelection re-expression from text-responses (URL/
  Query state) is NOT reused here initially — progress moves the slice
  as-is (move-not-rewrite; the grid's paging and selection interlock is
  too load-bearing to re-spine in the same change). Convergence belongs to
  the modernization pass. This asymmetry is deliberate and recorded.
- D3. GE parity: the candidate wraps the progress component in the same
  region-gating logic driven by `<html data-ge-region>`;
  `fa-teacher-dashboard.spec.ts` runs against the candidate route as the
  gate.
- D4. Performance non-regression is a first-class gate: fixture sections
  at realistic sizes (e.g. 30+ students, multi-unit courses) with render
  and interaction timing compared to legacy on the same machine; candidate
  must not be perceptibly slower (program recommendation M6).

## Risks / Trade-offs

- [Floating header/scrollbar rely on scroll math that differs under the
  candidate layout] → dedicated sub-split with its own tests; masks not
  applicable (no pixel gate) — behavior checks assert pinned positions at
  scroll offsets.
- [Three-slice interlock breaks under partial moves] → the store module
  moves whole, never slice-by-slice across changes.
- [Data volume: recorded fixtures for large sections are heavy] → one
  large recorded fixture set shared by tests and MSW; smaller synthetic
  fixtures for unit tests.

## Migration Plan

Wrappers + recordings → discovery → slice (a) grid read-only → slice (b)
floating chrome → slice (c) interactive surfaces → GE gate → flip map
entry (incl. bare-section redirect) → perf gate → verify. Rollback per
slice commit train.
