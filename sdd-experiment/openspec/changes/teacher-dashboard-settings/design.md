# Design: teacher-dashboard-settings

## Context

`DashboardSectionSettings.tsx` (TSX, DSCO/MUI-era) hosts the section setup
form shared with the section-creation flow (`sectionsRefresh/`), plus
delete and the save-blocker modal; on save it redirects to the progress
URL passed by the router. Curriculum pickers use
`valid_course_offerings` / `available_participant_types` (already wrapped
in core) with locale-filtered versions.

## Goals / Non-Goals

**Goals:** full settings parity — fields, validation, modals, delete,
redirect semantics — pixel-gated.

**Non-Goals:** no changes to the section-creation flow pages
(`sectionsRefresh/` remains legacy; homepage links to it); no new settings
fields; no CSRF-skip fix here (api-hygiene owns it).

## Decisions

- D1. Port like homepage (TSX + Query spine). The form components shared
  with `sectionsRefresh/` follow the dual-copy policy (copy into the
  package; creation flow keeps the legacy copy until its own migration).
- D2. Redirect-on-save goes through the shell per-tab map: settings does
  not hardcode a legacy or candidate progress URL; it asks the map for the
  `progress` destination. This is the same mechanism every tab flip uses.
- D3. Mutation wrappers: verify the existing core sections wrappers against
  recorded update/delete traffic before reuse (they predate this program);
  extend with any missing fields rather than forking.
- D4. Locale-filtered course versions and participant-type filtering are
  behavior scenarios with fixtures per locale/participant case — the
  filtering logic is part of parity, not an implementation detail.

## Risks / Trade-offs

- [Save-blocker/validation semantics subtly differ when re-spined onto
  Query mutations] → the local_nav_v2 Cucumber settings scenario plus
  component tests per validation branch are the gate; save/cancel/dirty
  states pinned.
- [Shared form components drift between package copy and sectionsRefresh]
  → dual-copy ledger entry, same policy as roster.

## Migration Plan

Verify wrappers → discovery → port form read path → port mutations
(save/delete/modals) → flip map entry → pixel baselines → verify.
Rollback: revert additive commits.
