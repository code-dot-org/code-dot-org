# Design: teacher-dashboard-assessments

## Context

Legacy JSX family: selector, three table kinds
(MultipleChoice/Match/FreeResponses containers + tables + detail dialogs),
surveys, `FeedbackDownload` (CSV), submission-status accounting in
`sectionAssessmentsRedux`; unit selection via the shared `unitSelection`
slice (re-expressed by text-responses). Empty states via
`ElementOrEmptyPage` (Router:236-249).

## Goals / Non-Goals

**Goals:** the full assessments surface — tables, dialogs, surveys, status,
feedback download — at behavior/copy/a11y parity.

**Non-Goals:** no pixel gate (legacy JSX); no new assessment types; no
grading features.

## Decisions

- D1. Move-not-rewrite, roster pattern: `sectionAssessmentsRedux`
  page-scoped + bridge; components move with adapters; detail dialogs keep
  their DSCO modal shells.
- D2. Endpoint family recorded per kind (assessments, surveys, responses,
  feedback) across MC/match/free-response fixtures before schemata are
  written; the feedback CSV download preserves its response handling
  (content-disposition), tested at the wrapper level.
- D3. Consume the shared unit-selector from text-responses; do not fork a
  second re-expression of `unitSelection`.

## Risks / Trade-offs

- [Widest read-only surface; scenario matrix is large] → the discovery
  gate enumerates distinct UI states per table kind (has-submissions,
  partial, none, anonymous-survey threshold) rather than per-question
  permutations; Cucumber assessments1/2 + feedback-download features are
  the floor.
- [CSV download behavior differs under Vite/candidate transport] →
  wrapper-level test for the download path; live check includes an actual
  file download.

## Migration Plan

Wrappers per endpoint kind → discovery → move slice + selector → move
tables/dialogs kind-by-kind (MC → match → free-response → surveys →
download) → flip map entry → verify. Rollback: revert additive commits.
