# Lab2 host/loader in Studio, AI for Oceans first

## Why

Studio (`frontend/apps/studio`) can render labs only as standalone
projects (`/projects/$labType/$channelId/edit`); it has no notion of
a course, lesson, or level, so no curriculum can run on the next-gen
platform. The Lab2 framework role — load level properties, resolve
the lab from `appName`, navigate a lesson, report completion —
exists only in the legacy webpack bundle (`apps/src/lab2`). The ngfp
prototype branches already contain most of the needed pieces against
a recent merge-base; porting them now gets AI for Oceans, an
eight-level course requiring no project persistence, running
end-to-end in Studio.

## What Changes

- New `packages/labs/base` package (npm name `@code-dot-org/lab`),
  ported from `ngfp/music-lab:frontend/packages/labs/base` with
  attribution: lab shell, level-properties context, lifecycle
  notifier, registry, metrics reporter, error boundary, loading UI.
- New Studio route
  `/courses/$courseName/units/$unitPosition/lessons/$lessonPosition/levels/$levelPosition`
  with a loader that fetches the unit structure
  (`GET /api/script_structure/courses/:course/units/:pos`) and the
  lesson `level_properties` map; lab resolution keyed by
  `levelProperties.appName` (`fish`, `standalone_video`), not URL.
- Minimal level navigation: prev/next links and a "Level x of y"
  indicator. The bubble progress bar and completion display are
  deferred to the header follow-up; progress is still recorded via
  milestones from day one.
- New `activities` domain in `core/api/dashboard`:
  `POST /milestone/:userId/:scriptLevelId/:levelId` (userId `0` when
  anonymous); the host, not the lab, reports completion.
- Studio-side oceans adapter mapping
  `levelProperties {mode, guides}` → `OceansLab` props and wiring
  `onContinue` → milestone → next level.
- Video levels stubbed: a placeholder for
  `appName: "standalone_video"` (level title + continue) keeps the
  eight-level progression intact; real video playback is a
  follow-up.
- MSW fixtures for the full oceans course so it runs backend-free
  (`VITE_API_MODE=msw`).
- Zero Rails changes: `level_properties` serializes all eight oceans
  levels today, and `script_structure` supplies script_level ids,
  positions, and names (verified against local Rails).
- Out of scope (design "Deferred scope"): project persistence
  (channels/sources), validation framework, client state store,
  Blockly labs.

## Capabilities

### New Capabilities

- `lab-base`: the `@code-dot-org/lab` package (`packages/labs/base`),
  analogous to `apps/src/lab2` — this change ports the host slice
  (lab shell, level-properties context, lifecycle events, registry,
  metrics, error/loading UI). Course-native labs consume it as their
  toolkit in later changes; embeddable labs (oceans) never depend on
  it.
- `course-level-routes`: course/unit/lesson/level routing in Studio,
  lesson-wide data loading, appName-keyed lab resolution, in-lesson
  navigation without shell remount, minimal prev/next level
  navigation.
- `milestone-reporting`: activities API domain, host-owned
  completion reporting for anonymous and signed-in users, MSW
  scenario-store progress recording.
- `oceans-course`: the AI for Oceans course running in Studio —
  oceans adapter, video-level stub, course fixtures, eight-level
  run-through ending at the lesson-complete state.

### Modified Capabilities

None (no existing specs).

## Impact

- New: `frontend/packages/labs/base/`.
- Modified: `frontend/apps/studio` (routes, lab resolution,
  adapters, fixtures registration), `frontend/packages/core`
  (`api/dashboard` activities domain, `script_structure` query, MSW
  handlers).
- Untouched: the `packages/labs/oceans` published artifact, the
  Rails dashboard, the legacy `apps/` bundle.
- Dependencies: ports from `origin/ngfp/music-lab` and
  `origin/ngfp/platform` with `cherry-pick -x` or `Co-authored-by`
  attribution (design "Attribution").
