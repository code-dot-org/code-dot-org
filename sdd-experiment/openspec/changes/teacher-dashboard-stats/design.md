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
- D2. Endpoint confirmation is the first task: record the exact stats
  request (URL, shape) from a local Rails run, then write the wrapper
  schema from the recording (the program's API catalog left it "confirm at
  feature start").
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
