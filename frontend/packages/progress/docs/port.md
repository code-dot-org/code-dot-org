# @code-dot-org/progress — port and compatibility

State of the `progress` package on `ngfp/progress-package` as of 2026-09-28,
measured against the `apps/` code it was cut from and against the hosts that
would consume it. Written for someone deciding what the package must do before
a lab or a Studio route depends on it.

## 1. What the package is

Commit e616ece4ac6 (2026-09-08) adds `frontend/packages/progress`. It carries
these pieces out of the legacy `apps/` bundle:

| Package file                 | Cut from                                                                                                                                                                    | Role                                                                                         |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `src/ProgressManager.ts`     | `apps/src/lab2/progress/ProgressManager.ts`                                                                                                                                 | Lab2 validation loop: runs a lab's `Validator` over level-authored conditions                |
| `src/ConditionsChecker.ts`   | `apps/src/lab2/progress/ConditionsChecker.ts`                                                                                                                               | Accumulates satisfied conditions for a validator                                             |
| `src/redux/progressSlice.ts` | `apps/src/code-studio/progressRedux.ts`, `progressReduxSelectors.js`, `activityUtils.js`, `browserNavigation.js`, `templates/progress/progressHelpers.js`, `viewAsRedux.js` | Unit, lesson and level state; server progress parsing; milestone posting; in-page navigation |
| `src/constants.ts`           | `apps/src/constants.js` (TestResults), `generated-scripts/sharedConstants` (LevelStatus), `types/progressTypes.ts`, `lab2/progress/constants.ts`                            | Result and status vocabularies                                                               |
| `src/types.ts`               | `apps/src/types/progressTypes.ts`, `apps/src/lab2/types.ts` (Validation, Condition, ExemplarSettings)                                                                       | Types; lesson and level shapes now come from `@code-dot-org/core/api`                        |

It depends on `@code-dot-org/core` for the lesson and level types (`Lesson`,
`UnitLevel`, `Sublevel`, `LevelKinds`, `AppOptions`, `ExemplarSettings`) and on
`@code-dot-org/users/redux` as a type only, for the `currentUser` slice the
submit thunk reads. The companion commit 638086b58d9 adds that users slice.

Build state: `yarn typecheck`, `yarn lint`, `yarn build` and `yarn test`
pass. Tests cover `queryUserProgress`, the reducers, level navigation and
milestone reporting; the overview selectors and the validators are untested.
On this branch there is no consumer: nothing under `frontend/`
imports `@code-dot-org/progress`. A stale `labs/codebridge/dist` left over
from another branch references it, which is the intended first consumer.

The port is hand-condensed, not a snapshot: no single `apps/` revision matches
it. Some pieces predate 2024 changes (level navigation pushes `url` where apps
has pushed `path` since #57547), some are current (exemplar validation from
#64114), and changes to the originals from 2025 and 2026 are missing
throughout. Section 3 lists them.

## 2. What holds up today

- **Result vocabulary.** `TestResults` matches `apps/src/constants.js` value
  for value, and the server's `ActivityConstants`
  (`dashboard/lib/activity_constants.rb`) agrees on every threshold it defines:
  pass at 20 and above, optimal at 30 and above, submitted 1000, review
  1500 and 2000, unsubmitted -50, skipped -100, keep-working -110.
  `MINIMUM_PASS_RESULT` and `MINIMUM_OPTIMAL_RESULT` are separate exports
  rather than members of `TestResults`; code ported from apps must be adjusted.
- **Status vocabulary.** `LevelStatuses` matches
  `SharedConstants::LEVEL_STATUS`, all ten values.
- **Server progress parsing.** `levelProgressFromServer`,
  `processServerStudentProgress`, `getLevelResult`, `activityCssClass`,
  `resultFromStatus` and `mergeActivityResult` are line-for-line ports and
  read the wire shape `UsersHelper#merge_user_progress_by_level` emits
  (`status`, `result`, `locked`, `paired`, `pages_completed`, `time_spent`,
  `teacher_feedback_*`, `last_progress_at`).
- **Lesson and level shapes.** The slice reads camelCased fields
  (`relativePosition`, `pageNumber`, `usesLab2`, `navigationType`, `letter`),
  which is what core's `LessonSchema`, `UnitLevelSchema` and `SublevelSchema`
  produce. Ids are numbers after core's transform; apps kept them as strings.
  A host must feed the slice through core's parsers, not raw script JSON.
- **ProgressManager and ConditionsChecker.** The validation loop is unchanged:
  `updateProgress` runs `checkConditions` once, walks the validations in
  order, sets `satisfied` from the first matching validation's `next`, and
  layers exemplar validation on top. `MusicValidator` and `DanceValidator` in
  apps already implement `clear()` with no argument and would compile against
  the package's `Validator`.
- **Store composition.** The slice follows the `core/redux` injection
  convention: the default export is the slice, `RootState` is derived through
  `MockStore<[progressSlice, currentUserSlice]>`, and the users slice is a
  type-only import so the package carries no users runtime.

## 3. Where it diverges from apps

### 3.1 Defects introduced by the port

These failed at runtime. All six are fixed, with tests under
`src/redux/__tests__/`; they are kept here as a record of the port.

1. **Fixed. `queryUserProgress` could not make its request.** `userProgressFromServer`
   calls `fetch('/api/user_progress/…', {body: …})` with no method. A GET with
   a body is rejected by the fetch spec before any network traffic
   (`TypeError: Request with GET/HEAD method cannot have body`, reproduced
   under Node 22). Apps sends `user_id` as a query parameter. The route is
   `get '/api/user_progress/:script'`; there is no POST.
2. **Fixed. The same promise never settled in the common case.** `resolve()` runs
   only when the response carries `completed: true`; every other response
   leaves the promise pending. Failure calls `reject()` with no value, and an
   exception inside the async IIFE becomes an unhandled rejection rather than
   a rejection of the returned promise. Apps returned the jQuery promise
   resolved with the response body; the apps test `userProgressFromServer`
   asserts on that body, and the legacy caller `progress.js#queryUserProgress`
   reads `data.signedIn` from it.

   The fix sends a plain GET with `user_id` in the query string and resolves
   with the body, typed `UserProgressResponse`. It rejects with an `Error` on
   a non-2xx response, a network failure or a missing `scriptName`. Apps
   threw that last one synchronously; it now arrives as a rejection.

3. **Fixed. Bubble state did not update after a milestone.** `sendReportHelper`
   dispatches `mergeResults` only. Apps also dispatches `mergeUnitProgress`
   (#70881, "fix for progress not updating", Feb 2026). `levelWithProgress`
   prefers `unitProgress` over `levelResults` for any level the server already
   had an entry for, so a level that was attempted before the page loaded
   never shows a later pass. The bug #70881 fixed is present again.

   The fix restores the `mergeUnitProgress` reducer and dispatches it for the
   level and, for a sublevel, its parent. An existing entry keeps its other
   fields; the result merges by `mergeActivityResult`.

4. **Fixed. `setWindowTitle` computed the wrong level index.** It matches
   `lessonLevel.position === newLevelId`, an id against a position. Apps
   matches `activeId`. It also reads `lesson.title` and `lesson.levels.length`
   where apps reads `lesson.name` and `num_script_lessons` (the number of
   lessons in the unit, which decides whether the unit name is shown), and it
   still says "Code.org" where apps has said "CodeAI" since #72991.

   The fix matches apps: `activeId`, `name`, `numScriptLessons` and "CodeAI".

5. **Fixed. `nextLevelId` indexed by `levelNumber`.** `levelNumber` is
   `title || position`, which is 1-based, so on an ordinary level the
   function returned the current level itself. It is `undefined` for
   unplugged levels, and with no current level at all, so there the index
   became -1 and the function returned the first level. Apps replaced this
   with `getNextLevel` (#74900, Aug 2026), which finds the current level by id
   and honours bubble-choice `navigationType` (`next_level`, `next_sublevel`,
   parent). The port always returns the parent for a sublevel.

   The fix ports `getParentLevel` and `getNextLevel`, adds
   `BubbleChoiceNavigationTypes` to the constants, and derives `nextLevelId`
   from `getNextLevel`.

6. **Fixed. `navigateToLevelId` pushed `newLevel.url`.** Apps has pushed `path`
   since #57547 (2024). `url` is the absolute studio URL from
   `build_script_level_url`; `pushState` accepts it on the same origin and
   throws `SecurityError` on any other, which is the dev-proxy case. It now
   pushes `path`.

### 3.2 Behaviour dropped from the milestone path

As ported, `sendReportHelper` posted `{app, result, testResult, program?,
submitted?}` and nothing else. Apps `sendReportForLevel` also sends, or does,
the following.
The `mergeUnitProgress` dispatch it also makes is restored; see 3.1 item 3.

- Fixed. `timeSinceLastMilestone` from `Lab2ProgressTimer` (elapsed time
  minus idle time), which the server stores as `UserLevel#time_spent`
  (`ActivitiesController#track_progress_for_user`). Without it every Lab2
  level recorded zero time. The package now has `MilestoneTimer`, a port of
  `Lab2ProgressTimer`, with one module-level instance, `milestoneTimer`. Every
  post sends its value, and the thunks reset it after a successful post and
  after an in-page level change. Two duties move to the host. Apps also
  reset the timer inside the `initProgress` reducer, which reading the clock
  would make impure, so the host resets it when it mounts a lab instead, as
  apps' `Lab2IdleTimer` already did. Idle detection was `react-idle-timer`
  in `Lab2IdleTimer`; no host under `frontend/` reports idleness yet, so
  until one calls `startIdle` and `endIdle`, idle time counts as time spent.
  The server caps each value at an hour.
- Fixed. `?course_id=` from `state.courseId`, which the server uses to set
  `UserLevel#unit_group_id` (#67708). Without it, progress recorded through
  the package was not attributed to a course.
- Fixed. A `.catch` that logs network failures through the metrics reporter
  (#73017). The port let them surface as unhandled rejections. The package
  now logs them through the observability plugin's `logger.warn`, with the
  message and `url` apps used. An HTTP error status is not logged, as in
  apps, where only a failed request reached the `.catch`. Either way the
  thunk resolves and progress is left unchanged.
- Fixed. `sendProgressReport(appType, result)` and
  `sendStartedReportIfNotStarted` (debounced `LEVEL_STARTED`, #72949, used by
  Sketch Lab). Both are ported; the debounce is apps' 100 ms leading edge.
- Fixed. `sendSuccessReportForLevel(levelId, appType)` (#69574, free-play and
  bubble-choice sublevel reporting). As in apps, every report now goes
  through one `sendReportForLevel`, which finds the level's script level
  through its parent when it is a sublevel.
- Fixed. `courseName` in state and in `InitProgressPayload` (#67364, used to
  load rubrics).

### 3.3 Behaviour dropped from the user-progress path

Apps dispatches `setVerified` from `isVerifiedInstructor` and
`authorizeLockable` from `lockableAuthorized`. The port dropped both.
`authorizeLockable` is fixed: the lesson-lock slice is now in this package
(3.10), and `queryUserProgress` dispatches it where apps did, a signed-out
response included. `setVerified` is still dropped; the verified-instructor
flag describes the signed-in user and belongs with the users package. Core's
`UserProgressResponseSchema` types `isVerifiedInstructor` for it.

### 3.4 Behaviour dropped from navigation

- `canChangeLevelInPage`: apps navigates in page only between two Lab2 levels
  and never on a `/summary` page; otherwise it cleans up the project manager
  and does a full navigation. The port always navigated in page. A host that
  mixes Lab2 and legacy levels in one lesson would push a URL and set
  `currentLevelId` for a level it cannot render.
- The navigation confirmation hook
  (`Lab2Registry#getLevelNavigationConfirmation`, #72140, the AI Tutor
  unsaved-review dialog).
- `notifyLevelChange` (the `LevelChangeRequested` lifecycle event) and
  `setupNavigationHandler` (browser back and forward).

These were couplings to apps singletons the package cannot import. All are
fixed through host hooks, installed with `configureLevelNavigation` in
`src/levelNavigation.ts`. It is a module-level registry, like
`milestoneTimer`, rather than something passed at store construction: core
builds the one store, with no thunk `extraArgument`, and apps changes its
confirmation hook while the page runs (the AI Tutor sets and clears it). A
call replaces only the hooks it names; `undefined` removes one.

| Apps coupling                                 | Hook                | Default                              |
| --------------------------------------------- | ------------------- | ------------------------------------ |
| `canChangeLevelInPage`                        | `canNavigateInPage` | `canChangeLevelInPage`, ported as is |
| `Lab2Registry#getLevelNavigationConfirmation` | `confirmNavigation` | none                                 |
| `notifyLevelChange`                           | `onLevelChange`     | none                                 |
| `ProjectManager#cleanUp` before a full reload | `beforeLeavingPage` | none                                 |
| `navigateToHref(getBubbleUrl(path, …, true))` | `leavePage`         | assigns `window.location.href`       |

The URL for a full navigation comes from `levelPageUrl`, which keeps the
current query string except `version`, as `getBubbleUrl` did.
`setupNavigationHandler` is ported as
`installLevelNavigationHandler(store, initialLevelId)`, which returns an
uninstaller; apps read the store from its global `getStore()`.

Differences from apps:

- `navigateToLevelId` returns before asking for confirmation when the
  requested level is the current one. Apps asked first.
- A level change through the back or forward button restarts
  `milestoneTimer`, as an in-page change already did. Apps did not, so the
  time on one level was reported against the next.
- `navigateToLevelId` and `navigateToNextLevel` return promises that settle
  once navigation is done, so `continueOrFinishLesson` awaits them. They
  previously returned before the confirmation was answered.

### 3.5 Selectors not ported

Fixed. `progressReduxSelectors.js` was folded in only partly. `getNextLevel`
and `getParentLevel` were ported with the navigation fixes; the rest are now
in `src/redux/progressSelectors.ts`: `levelsByLesson`, `groupedLessons`,
`progressionsFromLevels`, `lessons`, `hasLockableLessons`, `hasGroups`,
`getCurrentLesson`, `getLessonCount`, `levelCount`, `isPerfect`,
`lessonExtrasUrl`, `lessonTutorPath`, `hasLessonPlan`, and the peer-review
lesson and level synthesis.

Scope was an open decision: level page only, or the overview too. They are
all here, for two reasons. Each is a pure function of the progress slice's
state, so an overview package would have depended on this one anyway. And the
line between level page and overview does not hold in apps: the header's
mini view, shown on every level page, renders the unit progress table
through `hasGroups` and `groupedLessons`. The React views that consume them
(the progress table, the mini view, the teacher panel) belong to whichever
package builds the overview; nothing under `frontend/` does yet.

Differences from apps:

- The lesson fields `lessons` and the grouped lessons return follow core's
  camelCase schema (`lessonPlanHtmlUrl`, `descriptionStudent`), where apps
  returned the raw snake_case keys.
- Peer review levels take the number `PEER_REVIEW_ID` as their id, where apps
  used the string `'-1'`; ids are numbers throughout the package.
- `levelsByLesson` shares its level shaping with `levelsForLessonId` through
  a new `levelsForLesson(state, lesson)`, so the two cannot drift.

The port also typed `lessonGroups` with core's `LessonGroupSummary`, which is
an array of lessons, not a lesson group. Core now has `LessonGroupSchema`
for `LessonGroup#summarize`, and `lessonGroups` uses it. Core's `Lesson`
gained the `lessonTutorPath` the server sends, and its `UnitLevel` the
`progression` that `progressionsFromLevels` groups by.

### 3.6 Validation API changes

- Fixed. `Validator.clear()` and `resetValidation()` lost the
  `isChangingLevels` argument (#68218). Apps' `ValidationTracker` uses it to
  keep test names and mark results `PENDING` on a re-run, but discard them on
  a level change. Both methods take it again, optional, and `onLevelChange`
  passes `true`. `ValidationTracker` and `TestResultValidator` are ported,
  which is what Python Lab and Codebridge validate with, and
  `PASSED_ALL_TESTS_VALIDATION` now has its consumer.
- Partly fixed. `ProgressManager.onLevelChange` gained a leading `appOptions`
  parameter in place of the apps global `getAppOptionsEditingExemplar()`. It
  now takes only `Pick<AppOptions, 'isEditingExemplar'>`, the one field it
  reads, so a host can pass `{isEditingExemplar}`. The signature still
  differs from apps, which matters only to code ported from there.
- Fixed. `ConditionsChecker`'s logging flag moved from the
  `?log-validator-condition-changes` query parameter to a constructor
  argument. The argument now defaults to that query parameter, as apps read
  it; a host can still pass it explicitly.
- Fixed. `ProgressContainer` (mounts the manager, mirrors its state into
  redux, sends the success report) and `continueOrFinishLesson` (the
  Continue button's decision: send success when unvalidated and not
  submittable, predict or bubble-choice, then next level or finish URL) were
  not ported. Both depended on `lab2Redux` (`validationState`,
  `overrideValidations`, `levelProperties`), which has no equivalent under
  `frontend/`. Both are ported, with these differences:
  - `validationState` lives in the progress slice, with a
    `setValidationState` action. `labs/base` was the other candidate. It has
    no redux, and the state is progress logic that the continue thunk and
    the success report read, so it stays with them.
  - `ProgressContainer` takes the level's `validations`, `exemplarSettings`,
    `levelId`, `isEditingExemplar` and the start-mode `overrideValidations`
    as props. Apps read them from `lab2Redux` and the lab2 level-properties
    context. The progress package does not depend on `labs/base`; a host
    passes what `useLevelProperties()` gives it.
  - Apps built the manager with a callback that closed over the first
    render's `appType` and level type, so later changes never reached the
    success report. The container rebinds the callback through a new
    `ProgressManager.setOnProgressChange` whenever they change.
  - `continueOrFinishLesson(levelProperties, {showFinishDialog})` takes the
    level properties it reads, since there is no lab slice to read them
    from. The finish dialog was apps' `shareLab2Project`; it is a host
    callback now, and without one a finish URL is followed directly.
    Navigation to the next level is still the package's
    `navigateToNextLevel`, which follows the hooks in 3.4.

### 3.7 Type-level divergences

- Fixed. Two `ExemplarSettings`. `types.ts` declared the messages required;
  `ProgressManager` imports core's, where they are optional because the
  server omits them. `types.ts` now re-exports core's.
- Fixed. `Validation` and `Condition` had no schema in core, and
  `LevelPropertiesBaseSchema` did not list `validations`: passthrough kept
  the raw value, but `useLevelProperties().validations` was `unknown`. Core
  now has `ValidationSchema` and `ConditionSchema`, the level properties
  carry `validations` typed, and the progress package re-exports core's
  `Validation` and `Condition` instead of declaring its own. Two findings
  shaped the schema:

  - `key` is optional. `Javalab#get_validations` and
    `Pythonlab#get_validations` derive one PASSED_ALL_TESTS validation
    server side, with no key. The port's `Validation` required it.
  - A condition's `value` is a string, a number or absent, and one Music
    level file stores `null`, which parses as absent.

  The schema parses the validations of all 1,385 level files in
  `dashboard/config/levels` that have them, all Music and Dance, and the
  derived shape. 28 older Music files also hold a
  `level_data.validations` array; the server does not serve that one as
  `validations`, so the schema does not see it.

- `setScriptProgress` accepts `{[levelId]: UnitProgress}` (parsed, camelCase)
  but the reducer runs `processServerStudentProgress`, which expects the wire
  shape `UnitProgressDefinition`. Inherited from apps. Fixed: the payload is
  now typed `UnitProgressDefinition`.
- `queryUserProgress` was typed `ProgressThunkAction` (void) although callers
  need the promise. Fixed: it returns `Promise<UserProgressResponse>`.
- Fixed. `ViewTypes` and `ReviewStates` lacked `as const`, so `ViewType`
  widened to `string`.
- Fixed. `NumberedLevelFields.lastTimestamp?: string` against
  `UnitProgress.lastTimestamp: number | undefined`; both are numbers now,
  as the server sends seconds.
- `levelWithProgress` fixes an apps typo (`ids?.includes[currentLevelId]`
  became `ids?.includes(currentLevelId)`). This is a behaviour change: a level
  whose inactive ids include the current level is now marked current.
  Probably the intended behaviour, and now tested; apps still has the
  typo.
- Fixed. `processedLevel` never set `isUnplugged`, which apps derives from
  `display_as_unplugged` and `getIconForLevel` reads. Core's level carries
  it as `displayAsUnplugged`; `processedLevel` now maps it.
- `processedLessons` set `hidden: false` where apps strips the field. Fixed:
  it omits `hidden`, as apps does.
- Fixed. `progressSlice` was annotated `Slice<ProgressState>`, which widens
  its name to `string`. `MockStore` keys state by slice name, so the derived
  `RootState` was `{[x: string]: ProgressState}` rather than
  `{progress: ProgressState}`: `state.progress` type-checked, and so did any
  other key. Dropping the annotation is not enough: the inferred type names
  an immer internal, TypeScript cannot emit it (TS4023), and vite-plugin-dts
  silently skipped `dist/redux/progressSlice.d.ts`. The annotation is now
  `Slice<ProgressState, SliceCaseReducers<ProgressState>, 'progress'>`,
  which emits and keeps the literal name. A type test pins
  `ProgressRootState['progress']`.

### 3.8 Conventions

- Fixed. Both HTTP calls were hand-rolled `fetch`, where
  `frontend/AGENTS.md` requires `DashboardApiClient`. They now go through
  `DashboardApiClient.activities.reportMilestone`, extended with `app`,
  `program`, `submitted`, `timeSinceLastMilestone` and `courseId`, and a new
  `DashboardApiClient.progress.getUserProgress`, which parses the response
  with `UserProgressResponseSchema`. That schema is permissive: every field
  is optional and unnamed fields pass through. The request wire format is
  tested in core; the progress tests stub the two methods.

  One wire change follows. Apps and the port sent `result: true` as a JSON
  boolean. `ActivitiesController#milestone` compares it against the string
  `'true'`, and a JSON boolean arrives in `params` as a boolean, so the
  server read every Lab2 post as unsolved. Core sends it as a string, as its
  client already did for Studio, so a Lab2 post is now solved on the server.
  Solved matters in one place: with the `postFailedRunMilestone` gatekeeper
  off, the server refuses unsolved posts with 503 except on a unit's final
  level, so until now Lab2 progress was dropped under that setting.
  `submitted` was already sent as a string and is unchanged. This is read
  from the controller, not observed against a running server.

- Fixed. `package.json` had `"type": "module"` (conventions: do not add; it
  breaks the `apps/` webpack consumer) and `"version": "0.1.0"`
  (conventions: `0.0.0`); both are gone. `@reduxjs/toolkit` and
  `react-redux` moved to `peerDependencies`, at core's ranges, plus
  `devDependencies`. Unlike core, they are not optional: the slice needs
  them everywhere, and a second copy of `react-redux` would not see the
  host's store. `lodash` stays in `dependencies`, as core's utility
  libraries do. `clean-package.config.cjs` pointed `main` at a
  `dist/index.js` the build never emits; it names `dist/index.cjs` now.
- Fixed. `README.md` was the teacher-dashboard README pasted verbatim.
  `src/README.md` was `apps/src/lab2/progress/README.md` verbatim, apps-only
  pointers included; it is rewritten for this package as
  `docs/validation.md`.
- Partial tests. Ported from apps: the `userProgressFromServer`, reducer,
  `getParentLevel`, `nextLevelId`, `getNextLevel`, `levelsForLessonId` and
  `processedLessons` blocks. Apps' three `setViewType` cases all dispatched
  `Instructor` although two are named for students; the port dispatches
  `Participant` there. The peer-review, `levelsByLesson`, `groupedLessons`,
  `progressionsFromLevels`, `lessonExtrasUrl` and `isPerfect` blocks followed
  with the selectors in 3.5, `activityUtilsTest.js` and
  `progressHelpersTest.js` with the helpers in 3.9, and
  `hiddenLessonReduxTest.js` and `lessonLockReduxTest.js` with the slices in
  3.10. Apps has
  `progressReduxTest.js` (2074 lines: reducers, selectors,
  `userProgressFromServer`, peer reviews, bubble-choice navigation),
  `activityUtilsTest.js`, `progressHelpersTest.js` and
  `TestResultValidatorTest.ts`. All are portable to vitest and would have
  caught 3.1 items 1 through 5.

### 3.9 Helpers not ported

Fixed. The port took only the parsing helpers of
`apps/src/templates/progress/progressHelpers.js`. The rest of its pure
helpers are now in `src/progressHelpers.ts`: `lessonLocked`,
`getIconForLevel`, `isLevelAssessment`, `isLevelStatusCompleted`,
`lessonIsAllAssessment`, `lessonHasLevels`, `commentLeft`,
`studentNeedsFeedback`, `shouldShowReviewStates`, `lessonProgressForSection`
and `processServerSectionProgress`. They serve progress bubbles and the
teacher progress tables; they live here for the reason the selectors do.

`lessonIsVisible`, `lessonIsLockedForUser` and
`lessonIsLockedForAllStudents` followed with the slices in 3.10. Apps read
the selected section from the teacher-sections slice; these take it as an
argument, so this package does not depend on sections.

### 3.10 Hidden lessons and lesson locks

Fixed. Apps keeps them in `apps/src/code-studio/hiddenLessonRedux.js` and
`lessonLockRedux.js`, beside progress rather than in it. They are here now,
as `hiddenLessonSlice` and `lessonLockSlice` under their apps names
(`hiddenLesson`, `lessonLock`), with this package owning lesson and level
structure while teacher-dashboard keeps sections. Their requests go through
core: `progress.getHiddenLessons`, `toggleHidden`, `getLockStatus` and
`updateLockStatus`, with schemas for both responses.

Differences from apps:

- Apps stored the lock dialog's lock status, and rewrote it when the
  teacher-sections slice selected another section, the only thing tying the
  slice to sections. The port derives it: `getLockDialogStatus(state,
sectionId)`. `openLockDialog` takes the lesson id alone, and
  `refetchSectionLockStatus` no arguments.
- `GET /api/lock_status` ignores the `script_id` apps sent; it returns every
  section the user instructs. The port sends none. `loadSectionLockStatus`
  does the first load, which apps' teacher panel did by hand, and resolves
  with the response, whose section ids and names seed a host's sections.
- Apps' save checked each student's `user_level_id`, a field neither the
  server nor the dialog carries, so the check always passed. The port
  compares `user_level_data.user_id`.
- As in apps, `lockLesson` saves every student, including those already
  locked: saves compare against the open dialog, and none is open.
- Hidden-lesson state is plain objects where apps used Immutable maps. A
  failed toggle post keeps the local change, as apps did, and is now logged;
  apps' `window.__TestInterface` hook for Cucumber is gone.
- `getHiddenLessons` is a host's call. Apps' `progress.js` made it during
  page setup when the unit has hideable lessons.

## 4. Level validation for legacy (non-Lab2) labs

Legacy labs do not validate through anything this package contains. Their
path is:

1. The lab computes a `TestResults` value itself (block checks in
   `feedback.js`, app-specific tests) and calls `StudioApp#report`.
2. `report` adds `pass`, `time`, `timeSinceLastMilestone`, `attempt` and
   `lines`, then hands the report to `appOptions.onAttempt`
   (`code-studio/initApp/loadApp.js`), which adds `program`, `image`,
   `callback` (the milestone URL from `appOptions.report.callback`) and
   `fallbackResponse`.
3. `code-studio/reporting.js#sendReport` merges the result into redux, writes
   it to session storage for signed-out users, gates on `postMilestoneMode`,
   and POSTs the report form-encoded with a CSRF header and a 15 second
   timeout. The response (`redirect`, `video_info`,
   `end_of_lesson_experience`, `lesson_changing`, `share_failure`,
   `level_source`) drives the finish dialog and the next-level redirect.
   `cancelReport` aborts the in-flight post on Reset.

The package's milestone client sends five fields, ignores the response body,
and has no cancel, no timeout, no fallback response, no session-storage path
for signed-out users and no `postMilestoneMode` gate. It cannot replace
`reporting.js`.

What the package can carry for legacy labs today is the shared vocabulary and
the read side: `TestResults`, `LevelStatuses`, result merging, and parsing of
`/api/user_progress`. The legacy write side would need a `MilestoneReport`
with the full field list above (`level`, `pass`, `time`,
`timeSinceLastMilestone`, `attempt`, `lines`, `image`, `allowMultipleSends`,
`skipSuccessCallback`) and a typed `MilestoneResponse`, best placed as a
`DashboardApiClient.activities` extension so Lab2 and legacy posts share one
client. That is a design decision, not a port. It is out of scope for this
branch and the README says so until it is made.

## 5. What was verified, and how

- `yarn typecheck`, `yarn lint` and `yarn build` in
  `frontend/packages/progress` under Node 22: all pass.
- Each package file diffed against its apps source at the branch point
  (merge-base 3b34a28d6db, 2026-09-08). The apps originals have not changed on
  `origin/staging` since, so the divergences above are the port's, not drift.
- Rechecked after rebasing onto `origin/staging` (2026-09-28): the apps
  progress code is still unchanged. `ActivitiesController#milestone` now
  also records anonymous users' progress and time spent (#74939, #75173),
  identified by a request cookie; the client sends nothing new, so the port
  needs no change.
- The GET-with-body failure reproduced with `new Request(...)` under Node 22.
- Server contracts read from `ActivitiesController#milestone`,
  `ApiController#user_progress`, `UsersHelper#summarize_user_progress` and
  `config/routes.rb`.
- Not verified: any behaviour in a browser. No host on this branch mounts the
  slice.

## 6. Proposed order of work

1. Done. Fix 3.1 items 1 through 6 and port the apps tests that pin them.
2. Done. Restore the milestone fields (`timeSinceLastMilestone`,
   `course_id`) and `mergeUnitProgress`. The timer is a module singleton, as
   in apps; see 3.2. A host still owes a lab-mount reset and idle reporting.
3. Done. Move both requests onto `DashboardApiClient`: extend
   `activities.reportMilestone` with the Lab2 fields, add
   `progress.getUserProgress` with a zod schema for
   `summarize_user_progress`, and give `isVerifiedInstructor` and
   `lockableAuthorized` a typed place in that response even before a slice
   consumes them.
4. Done. Restore `clear(isChangingLevels)` and port `ValidationTracker`,
   `TestResultValidator`, `ProgressContainer` and `continueOrFinishLesson`.
   `validationState` went to the progress slice; see 3.6.
5. Done. Replace the apps-singleton couplings in navigation with host hooks.
   They are a module-level registry rather than store or container
   arguments; see 3.4.
6. Done. Add `validations` to core's `LevelPropertiesBaseSchema`, with
   `Validation` and `Condition` schemas, so labs stop narrowing `unknown`.
7. Done. Decide the scope of the selectors in 3.5 (level page only, or
   overview too) and port accordingly. All of them are here; see 3.5.
8. Done. Clean the manifest per `docs/conventions/packages.md`, delete the
   duplicate `ExemplarSettings`, add `as const` to `ViewTypes` and
   `ReviewStates`, replace `src/README.md`.
9. Decide whether legacy milestone reporting (section 4) is in scope. If it
   is, it is a new `MilestoneReport` and `MilestoneResponse` design on the
   shared client, not a port of `reporting.js`.
