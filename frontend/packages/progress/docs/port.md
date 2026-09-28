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
pass. The only tests cover `queryUserProgress`. On this branch there is no
consumer: nothing under `frontend/`
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

These fail at runtime. Items 1 and 2 are fixed, with tests in
`src/redux/__tests__/queryUserProgress.test.ts`; they are kept here as a
record of the port.

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

3. **Bubble state does not update after a milestone.** `sendReportHelper`
   dispatches `mergeResults` only. Apps also dispatches `mergeUnitProgress`
   (#70881, "fix for progress not updating", Feb 2026). `levelWithProgress`
   prefers `unitProgress` over `levelResults` for any level the server already
   had an entry for, so a level that was attempted before the page loaded
   never shows a later pass. The bug #70881 fixed is present again.
4. **`setWindowTitle` computes the wrong level index.** It matches
   `lessonLevel.position === newLevelId`, an id against a position. Apps
   matches `activeId`. It also reads `lesson.title` and `lesson.levels.length`
   where apps reads `lesson.name` and `num_script_lessons` (the number of
   lessons in the unit, which decides whether the unit name is shown), and it
   still says "Code.org" where apps has said "CodeAI" since #72991.
5. **`nextLevelId` indexes by `levelNumber`.** `levelNumber` is
   `title || position`, which is `undefined` for unplugged levels; the index
   becomes -1 and the function returns the first level. Apps replaced this
   with `getNextLevel` (#74900, Aug 2026), which finds the current level by id
   and honours bubble-choice `navigationType` (`next_level`, `next_sublevel`,
   parent). The port always returns the parent for a sublevel.
6. **`navigateToLevelId` pushes `newLevel.url`.** Apps has pushed `path`
   since #57547 (2024). `url` is the absolute studio URL from
   `build_script_level_url`; `pushState` accepts it on the same origin and
   throws `SecurityError` on any other, which is the dev-proxy case.

### 3.2 Behaviour dropped from the milestone path

`sendReportHelper` posts `{app, result, testResult, program?, submitted?}` and
nothing else. Apps `sendReportForLevel` also sends, or does:

- `timeSinceLastMilestone` from `Lab2ProgressTimer` (elapsed time minus idle
  time), which the server stores as `UserLevel#time_spent`
  (`ActivitiesController#track_progress_for_user`). Without it every Lab2
  level records zero time. The timer reset on `initProgress` and after each
  successful post is gone too.
- `?course_id=` from `state.courseId`, which the server uses to set
  `UserLevel#unit_group_id` (#67708). Progress recorded through the package is
  not attributed to a course.
- A `.catch` that logs network failures through the metrics reporter
  (#73017). The package lets them surface as unhandled rejections.
- `sendProgressReport(appType, result)` and `sendStartedReportIfNotStarted`
  (debounced `LEVEL_STARTED`, #72949, used by Sketch Lab).
- `sendSuccessReportForLevel(levelId, appType)` (#69574, free-play and
  bubble-choice sublevel reporting).
- `courseName` in state and in `InitProgressPayload` (#67364, used to load
  rubrics).

### 3.3 Behaviour dropped from the user-progress path

Apps dispatches `setVerified` from `isVerifiedInstructor` and
`authorizeLockable` from `lockableAuthorized`. Neither slice exists under
`frontend/`, so the port silently drops both fields. Lockable lessons and
verified-teacher gating have no home yet; whichever package takes them must
read these two fields from the same response.

### 3.4 Behaviour dropped from navigation

- `canChangeLevelInPage`: apps navigates in page only between two Lab2 levels
  and never on a `/summary` page; otherwise it cleans up the project manager
  and does a full navigation. The port always navigates in page. A host that
  mixes Lab2 and legacy levels in one lesson will push a URL and set
  `currentLevelId` for a level it cannot render.
- The navigation confirmation hook
  (`Lab2Registry#getLevelNavigationConfirmation`, #72140, the AI Tutor
  unsaved-review dialog).
- `notifyLevelChange` (the `LevelChangeRequested` lifecycle event) and
  `setupNavigationHandler` (browser back and forward).

These are couplings to apps singletons the package cannot import. They need
an injection point, a host-supplied hook or the host doing the navigation
itself, rather than silent removal.

### 3.5 Selectors not ported

`progressReduxSelectors.js` was folded in only partly. Missing:
`getNextLevel`, `getParentLevel`, `levelsByLesson`, `groupedLessons`,
`progressionsFromLevels`, `lessons`, `hasLockableLessons`, `hasGroups`,
`getCurrentLesson`, `getLessonCount`, `levelCount`, `isPerfect`,
`lessonExtrasUrl`, `lessonTutorPath`, `hasLessonPlan`, and the peer-review
lesson and level synthesis. Most serve the unit overview and the progress
table rather than the level page. Whether they belong here or in a future
overview package is an open scoping decision. Either way, the level-page ones
(`getNextLevel`, `getParentLevel`) are needed to fix 3.1 item 5.

### 3.6 Validation API changes

- `Validator.clear()` and `resetValidation()` lost the `isChangingLevels`
  argument (#68218). Apps' `ValidationTracker` uses it to keep test names and
  mark results `PENDING` on a re-run, but discard them on a level change.
  `TestResultValidator` and `ValidationTracker` were not ported, so the
  upper-grade labs (Python Lab, Codebridge) that validate with
  levelbuilder-written tests cannot be built on the package until the argument
  returns. `PASSED_ALL_TESTS_VALIDATION` was ported and has no consumer
  without them.
- `ProgressManager.onLevelChange` gained a leading `appOptions` parameter in
  place of the apps global `getAppOptionsEditingExemplar()`. Reasonable, but
  it breaks every apps `ProgressContainer` call, and only `isEditingExemplar`
  is read. A narrower `{isEditingExemplar?: boolean}` would decouple it from
  core's full `AppOptions`.
- `ConditionsChecker`'s logging flag moved from the
  `?log-validator-condition-changes` query parameter to a constructor
  argument. The host must read the query string and pass it through if that
  debugging aid is to survive.
- `ProgressContainer` (mounts the manager, mirrors its state into redux, sends
  the success report) and `continueOrFinishLesson` (the Continue button's
  decision: send success when unvalidated and not submittable, predict or
  bubble-choice, then next level or finish URL) were not ported. Both depend
  on `lab2Redux` (`validationState`, `overrideValidations`,
  `levelProperties`), which has no equivalent in `labs/base` yet.

### 3.7 Type-level divergences

- Two `ExemplarSettings`. `types.ts` declares the messages required;
  `ProgressManager` imports core's, where they are optional because the
  server omits them. The package's own definition is dead and contradicts the
  one in use.
- `Validation` and `Condition` have no schema in core.
  `LevelPropertiesBaseSchema` does not list `validations`; passthrough keeps
  the raw value, but `useLevelProperties().validations` is `unknown`. A lab
  must narrow it, or core must gain the schema.
- `setScriptProgress` accepts `{[levelId]: UnitProgress}` (parsed, camelCase)
  but the reducer runs `processServerStudentProgress`, which expects the wire
  shape `UnitProgressDefinition`. Inherited from apps. Fixed: the payload is
  now typed `UnitProgressDefinition`.
- `queryUserProgress` was typed `ProgressThunkAction` (void) although callers
  need the promise. Fixed: it returns `Promise<UserProgressResponse>`.
- `ViewTypes` and `ReviewStates` lack `as const`, so `ViewType` widens to
  `string`.
- `NumberedLevelFields.lastTimestamp?: string` against
  `UnitProgress.lastTimestamp: number | undefined`.
- `levelWithProgress` fixes an apps typo (`ids?.includes[currentLevelId]`
  became `ids?.includes(currentLevelId)`). This is a behaviour change: a level
  whose inactive ids include the current level is now marked current.
  Probably the intended behaviour; it is untested, and apps still has the
  typo.

### 3.8 Conventions

- Both HTTP calls are hand-rolled `fetch`. `frontend/AGENTS.md` requires
  `DashboardApiClient`. Core already has `activities.reportMilestone`, which
  Studio's course route uses, but it sends only `result` and `testResult`;
  there is no user-progress client at all. The transport adds the CSRF header
  on non-GET requests and parses JSON. The milestone route is exempt from
  forgery protection, which is the only reason the bare fetch works.
- `package.json` has `"type": "module"` (conventions: do not add; it breaks
  the `apps/` webpack consumer) and `"version": "0.1.0"` (conventions:
  `0.0.0`). `lodash`, `react-redux` and `@reduxjs/toolkit` sit in
  `dependencies`; conventions want externalized deps in `peerDependencies`
  plus `devDependencies`. `users` places `@reduxjs/toolkit` the same way, so
  the precedent is mixed.
- `README.md` was the teacher-dashboard README pasted verbatim (replaced
  alongside this document). `src/README.md` is
  `apps/src/lab2/progress/README.md` verbatim, apps-only pointers included.
- Few tests. Only the `userProgressFromServer` block has been ported. Apps has
  `progressReduxTest.js` (2074 lines: reducers, selectors,
  `userProgressFromServer`, peer reviews, bubble-choice navigation),
  `activityUtilsTest.js`, `progressHelpersTest.js` and
  `TestResultValidatorTest.ts`. All are portable to vitest and would have
  caught 3.1 items 1 through 5.

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
- The GET-with-body failure reproduced with `new Request(...)` under Node 22.
- Server contracts read from `ActivitiesController#milestone`,
  `ApiController#user_progress`, `UsersHelper#summarize_user_progress` and
  `config/routes.rb`.
- Not verified: any behaviour in a browser. No host on this branch mounts the
  slice.

## 6. Proposed order of work

1. Fix 3.1 items 1 through 6 and port the apps tests that pin them. Items 1
   and 2 and the `userProgressFromServer` tests are done. Still to port are
   the tests for `nextLevelId`, `getNextLevel`, `levelsForLessonId` and the
   reducers.
2. Restore the milestone fields (`timeSinceLastMilestone`, `course_id`) and
   `mergeUnitProgress`. Timer ownership needs a decision: a module singleton
   as in apps, or state on the slice.
3. Move both requests onto `DashboardApiClient`: extend
   `activities.reportMilestone` with the Lab2 fields, add
   `progress.getUserProgress` with a zod schema for
   `summarize_user_progress`, and give `isVerifiedInstructor` and
   `lockableAuthorized` a typed place in that response even before a slice
   consumes them.
4. Restore `clear(isChangingLevels)` and port `ValidationTracker`,
   `TestResultValidator`, `ProgressContainer` and `continueOrFinishLesson`.
   The last two need a `validationState` home; the natural one is
   `labs/base`, which already owns the host and lab boundary.
5. Replace the apps-singleton couplings in navigation with host hooks
   (`canNavigateInPage`, `confirmNavigation`, `onLevelChange`) supplied at
   store or container construction.
6. Add `validations` to core's `LevelPropertiesBaseSchema`, with `Validation`
   and `Condition` schemas, so labs stop narrowing `unknown`.
7. Decide the scope of the selectors in 3.5 (level page only, or overview
   too) and port accordingly.
8. Clean the manifest per `docs/conventions/packages.md`, delete the
   duplicate `ExemplarSettings`, add `as const` to `ViewTypes` and
   `ReviewStates`, replace `src/README.md`.
9. Decide whether legacy milestone reporting (section 4) is in scope. If it
   is, it is a new `MilestoneReport` and `MilestoneResponse` design on the
   shared client, not a port of `reporting.js`.
