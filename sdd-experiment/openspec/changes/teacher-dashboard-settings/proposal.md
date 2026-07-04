# Proposal: teacher-dashboard-settings

Position 11 in the migration sequence. Depends on `teacher-dashboard-shell`
and reuses the section-mutation wrappers from
`teacher-dashboard-homepage-v2` (edit/delete flows share endpoints).

## Why

Settings (`.../sections/:sectionId/settings`) is the section-edit tab.
`DashboardSectionSettings.tsx` is an 88-line wrapper (loading gate +
dirty-navigation blocker + DSCO save-blocker modal); the actual form is
`sectionsRefresh/SectionsSetUpContainer` — the SAME container as the
section-creation flow — editing name, grade chips, curriculum quick-assign
(participant-type + locale-filtered versions via
`GET /course_offerings/quick_assign_course_offerings`), lesson extras,
pairing, text-to-speech, project sharing, restrict-section, and
coteachers. Save is `PATCH /api/v1/sections/:id` with an `X-CSRF-Token`
header and a full-page redirect to the progress URL passed by the router.
CORRECTED from earlier planning: there is no section-delete on this tab
(delete lives on the homepage options dropdown), and the offerings
endpoint is `quick_assign_course_offerings`, not `valid_course_offerings`.
Full contract tables are in design.md.

## What Changes

- Candidate route `.../sections/:sectionId/settings` renders the ported
  settings form with every legacy field, native validation, the
  save-blocker modal (re-implemented on the host router's blocker API —
  recorded rewrite), and the on-save redirect to the progress destination
  via the shell's per-tab map (candidate progress once it exists; legacy
  URL until then).
- Section update, quick-assign offerings, and coteacher
  check/add/remove reuse existing endpoints through typed wrappers whose
  schemata come from recorded legacy traffic (BLOCKED-EVIDENCE captures
  listed in design.md).
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
