# Proposal: teacher-dashboard-settings

Position 11 in the migration sequence. Depends on `teacher-dashboard-shell`
and reuses the section-mutation wrappers from
`teacher-dashboard-homepage-v2` (edit/delete flows share endpoints).

## Why

Settings (`.../sections/:sectionId/settings`) is the section-edit tab:
`DashboardSectionSettings.tsx`
(`apps/src/templates/teacherNavigation/`) edits section name, grade,
curriculum assignment (with version/participant filtering), lesson extras,
pairing, text-to-speech, project sharing, and restrict-section, plus
section delete — with a save-blocker confirmation modal and a redirect to
the progress tab on successful save (Router passes the progress URL as
`redirectUrl`). It is mutation-heavy but self-contained, and it shares the
curriculum-assignment machinery (valid course offerings, participant
types) already wrapped in core.

## What Changes

- Candidate route `.../sections/:sectionId/settings` renders the ported
  settings form with every legacy field, validation, the save-blocker
  modal, delete with confirmation, and the on-save redirect to the
  progress destination via the shell's per-tab map (candidate progress
  once it exists; legacy URL until then).
- Section update/delete and course-offering lookups reuse existing
  endpoints through typed wrappers (`valid_course_offerings` and
  `available_participant_types` are already wrapped in core
  `sections.api.ts`; verify then reuse).
- Shell per-tab map flips `settings` to the candidate route.
- Pixel gate applies (TSX/DSCO-era surface: DSCO inputs, MUI buttons,
  i18n modal).

## Capabilities

### New Capabilities

- `teacher-dashboard-settings-page`: the ported settings tab — full field
  set, save/delete flows, save-blocker modal, redirect semantics, typed
  data paths, scenarios, pixel parity.

### Modified Capabilities

None — the shell's per-tab map anticipates the flip.

## Impact

- `frontend/packages/teacher-dashboard` (settings area), core wrappers
  (verify existing sections wrappers), Studio route content, shell map
  entry. No Rails changes. Note: `sections#update` currently skips CSRF
  (legacy quirk; retirement planned in `teacher-dashboard-api-hygiene`) —
  the candidate client sends tokens regardless.
