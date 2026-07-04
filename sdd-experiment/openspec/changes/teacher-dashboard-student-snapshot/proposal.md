# Proposal: teacher-dashboard-student-snapshot

Position 16 in the migration sequence (last). Depends on
`teacher-dashboard-shell` (flag-gated route/sidebar entry) and benefits
from the progress change's data machinery (lesson progress data feeds
several widgets).

## Why

Student snapshot (`.../sections/:sectionId/student_snapshot`,
`apps/src/templates/studentSnapshot/`) is an experiment-gated
(`student-snapshot`, Router:288) per-student insight surface composed of
widgets: code widget, lesson feedback, lesson insight, student CFU,
lesson progress details, and student rubric, under a snapshot header. It
is part of the V2 surface and MUST port so the experiment can run against
the candidate. It shares the progress empty-state matrix
(Router:292-296).

## What Changes

- Candidate route `.../sections/:sectionId/student_snapshot` renders the
  ported snapshot (header + all six widgets) when experiment
  `student-snapshot` is on, with the no-students/no-curriculum empty-state
  matrix; absent when off. Both arms are scenario axes.
- Each widget's data dependencies are recorded at implementation start and
  wrapped (typed schemata + MSW), reusing the progress change's wrappers
  where the payloads overlap.
- Pixel gate applies (modern TSX/MUI/DSCO surface —
  `studentSnapshot/` imports MUI ×21, DSCO alert/dropdown/textField).

## Capabilities

### New Capabilities

- `teacher-dashboard-student-snapshot-page`: the ported snapshot tab under
  its experiment gate — header, six widgets, data paths, scenarios, pixel
  parity.

### Modified Capabilities

None — the shell's flag-gated route/sidebar entry and per-tab map
anticipate the content landing.

## Impact

- `frontend/packages/teacher-dashboard` (snapshot area), core
  wrappers/mocks, Studio route content, shell map entry. No Rails changes.
