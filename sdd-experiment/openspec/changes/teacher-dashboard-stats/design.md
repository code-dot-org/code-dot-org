# Design: teacher-dashboard-stats

## Context

`StatsTableWithData` connects to `statsRedux` (async load per section) and
`teacherSections`; `ElementOrEmptyPage` gates rendering on
studentCount/anyStudentHasProgress (Router:200-209). Legacy JSX, no DSCO
beyond incidental widgets.

## Goals / Non-Goals

**Goals:** stats at behavior/copy/a11y parity in the candidate shell; the
per-tab pipeline template every later tab reuses.

**Non-Goals:** no visual redesign (no pixel gate; non-DSCO legacy UI); no
endpoint changes; no PL landing surface (`/my-professional-learning`) —
only the participant-type branch inside this tab.

## Decisions

- D1. Move-not-rewrite, roster pattern at small scale: `statsRedux` runs in
  a page-scoped store with the one-way bridge to shell Query state;
  components move with import adapters (`@cdo/locale`, HttpClient → core
  transport). Blocker evidence rule applies.
- D2. Endpoint PINNED (2026-07-04 hardening): the stats tab loads
  `GET /dashboardapi/sections/:sectionId/students/completed_levels_count`
  via `$.ajax` (`statsRedux.js:59-60`) — the same endpoint the roster's
  completed-levels column uses; one CORE DashboardApi wrapper serves
  both (human ruling: all Rails wrappers in
  `core/src/api/dashboard/...`; the feature owns fixtures only).
  Response shape remains capture-gated (BLOCKED-EVIDENCE: one runtime
  JSON capture; also confirm whether the lines-of-code column derives
  from this response or another source — pin from `StatsTableWithData`
  before wrappers).
- D3. Empty-state gating reuses the shell's `ElementOrEmptyPage`
  equivalent (studentCount, anyStudentHasProgress from the selected-section
  query) — shared shell component, not per-tab logic.

## Risks / Trade-offs

- [PL participant-type branch under-tested in legacy] → `pl_sections`
  Cucumber feature + a dedicated PL MSW scenario are the oracle; the
  branch is exercised by a component test.

## Migration Plan

Data layer → discovery → move UI → flip map entry → verify. Rollback:
revert additive commits; legacy untouched.
