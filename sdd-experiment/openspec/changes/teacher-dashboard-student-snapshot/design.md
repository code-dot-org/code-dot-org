# Design: teacher-dashboard-student-snapshot

## Context

Widget-composed TSX surface (`codeWidget`, `lessonFeedbackWidget`,
`lessonInsightWidget`, `studentCFUWidget`,
`studentLessonProgressDetailsWidget`, `studentRubricWidget`,
`widgetTemplate`, `header`) behind experiment `student-snapshot`. Modern
MUI/DSCO throughout. Data contracts unpinned in the program catalog;
several widgets read lesson-progress-shaped data.

## Goals / Non-Goals

**Goals:** the gated snapshot tab at parity so the experiment can run
against the candidate; all six widgets.

**Non-Goals:** no widget development; no un-gating; no rubric/CFU backend
changes.

## Decisions

- D1. Port like homepage (TSX + Query spine), widget by widget on the
  shared `widgetTemplate`; the header first (it frames every widget).
- D2. Data recording per widget before schemata; reuse progress-change
  wrappers where payloads overlap (lesson progress details) instead of
  re-wrapping.
- D3. Same active-development caveat as skills dashboard: copy at a
  recorded legacy SHA, divergence ledger entry, scheduled last (position
  16) to minimize the drift window.

## Risks / Trade-offs

- [Six widgets × per-student data = widest unpinned contract surface] →
  per-widget recording tasks; widgets land incrementally behind the gate,
  each with its own scenarios.
- [Experiment may evolve or be dropped before position 16] → if the
  experiment is retired upstream, this change is closed with a recorded
  disposition instead of implemented — that decision is visible, not
  silent.

## Migration Plan

Record per widget → discovery → header + widgetTemplate → widgets
incrementally → verify. Rollback: revert additive commits.
