# @code-dot-org/progress

Level progress and lesson structure for labs and Studio: the Lab2
validation loop (`ProgressManager`, `ConditionsChecker`), the `progress`
redux slice (unit, lesson and level state; server progress parsing;
milestone posting; in-page level navigation), the `hiddenLesson` and
`lessonLock` slices (which lessons each section hides and locks), and the
`TestResults` and `LevelStatuses` vocabularies shared with Rails.

Ported from `apps/src/lab2/progress`, `apps/src/code-studio/progressRedux.ts`
and their helpers. The full compatibility assessment, including every known
divergence from `apps/` and the proposed order of work, is in
[docs/port.md](docs/port.md).
How validation works is in [docs/validation.md](docs/validation.md).

## Status

Experimental. Builds, typechecks, lints and passes its tests; nothing
consumes it yet. It is at parity with the apps code it was cut from, except
where docs/port.md records a deliberate difference, and for these, which
wait on a host or on other packages:

- No host reports idleness to `milestoneTimer` yet, so idle time counts as
  time spent.
- The verified-instructor flag from `/api/user_progress` is not stored; it
  belongs with the users package.

Legacy (non-Lab2) labs report progress through
`apps/src/code-studio/reporting.js`. This package shares their result
vocabulary and can read their progress, but it does not replace that client;
whether it should is an open design decision (docs/port.md, section 4).

## Exports

`@code-dot-org/progress`:

| Export                                                                                                                                             | Kind            | Purpose                                                                              |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------ |
| `ProgressManager`                                                                                                                                  | Class           | Runs a lab's `Validator` over the level's validations; reports through a callback    |
| `ProgressContainer`, `useProgressManager`, `ProgressManagerContext`                                                                                | Component, hook | Owns a lab's `ProgressManager`, mirrors it into the slice, reports success           |
| `TestResultValidator`, `ValidationTracker`, `TestResultConditionTypes`                                                                             | Classes         | Validation by levelbuilder-written tests, for Python Lab and Codebridge              |
| `ConditionsChecker`                                                                                                                                | Class           | Accumulates satisfied conditions for a validator                                     |
| `milestoneTimer`, `MilestoneTimer`                                                                                                                 | Instance, class | Time on the level since the last milestone, less idle time; sent with each post      |
| `configureLevelNavigation`, `resetLevelNavigation`, `canChangeLevelInPage`, `levelPageUrl`                                                         | Functions       | The host's part in moving between levels                                             |
| `getInitialValidationState`                                                                                                                        | Function        | An empty `ValidationState`                                                           |
| `TestResults`, `MINIMUM_PASS_RESULT`, `MINIMUM_OPTIMAL_RESULT`                                                                                     | Constants       | Numeric result codes, matching `apps/src/constants.js` and Rails `ActivityConstants` |
| `getIconForLevel`, `lessonProgressForSection`, `processServerSectionProgress`, `isLevelStatusCompleted`, `lessonLocked`, `studentNeedsFeedback`, … | Functions       | Pure helpers for progress bubbles and progress tables                                |
| `LevelStatuses`, `ProgressLevelTypes`, `ViewTypes`, `PUZZLE_PAGE_NONE`, `PASSED_ALL_TESTS_VALIDATION`                                              | Constants       |                                                                                      |
| `Validator`, `Validation`, `Condition`, `ValidationState`, `ProgressState`, `UnitProgress`, `NumberedLevel`, …                                     | Types           |                                                                                      |

`@code-dot-org/progress/redux`:

| Export                                                                                                                                                                                                                                           | Kind          | Purpose                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- | ------------------------------------------------------------------------------ |
| `progressSlice` (default)                                                                                                                                                                                                                        | Slice         | Inject with `injectSlices` from `@code-dot-org/core/redux`                     |
| `initProgress`, `setValidationState`, `setCurrentLevelId`, `setScriptProgress`, `mergeResults`, …                                                                                                                                                | Actions       |                                                                                |
| `queryUserProgress`, `sendSuccessReport`, `sendSuccessReportForLevel`, `sendProgressReport`, `sendStartedReportIfNotStarted`, `sendSubmitReport`, `sendPredictLevelReport`, `navigateToLevelId`, `navigateToNextLevel`, `continueOrFinishLesson` | Thunks        | Request through `DashboardApiClient`                                           |
| `installLevelNavigationHandler`                                                                                                                                                                                                                  | Function      | Follows back and forward between in-page levels                                |
| `hiddenLessonSlice`, `getHiddenLessons`, `toggleHiddenLesson`, `toggleHiddenScript`, `initializeHiddenScripts`, `isLessonHiddenForSection`                                                                                                       | Slice, thunks | Lessons and units each section hides                                           |
| `lessonLockSlice`, `loadSectionLockStatus`, `openLockDialog`, `saveLockDialog`, `lockLesson`, `getLockDialogStatus`, `fullyLockedLessonMapping`                                                                                                  | Slice, thunks | Per-student locks on lockable lessons, and the lock dialog                     |
| `getCurrentLevel`, `getCurrentLevels`, `getCurrentScriptLevelId`, `getParentLevel`, `getNextLevel`, `nextLevelId`, `levelsForLessonId`, `levelById`, `getProgressLevelType`, `getUserAppOptionsPath`                                             | Selectors     | Take the root state                                                            |
| `groupedLessons`, `levelsByLesson`, `lessons`, `progressionsFromLevels`, `hasGroups`, `hasLockableLessons`, `getCurrentLesson`, `getLessonCount`, `levelCount`, `isPerfect`, `lessonExtrasUrl`, `lessonTutorPath`, `hasLessonPlan`               | Selectors     | For the unit overview, progress table and lesson header; signatures as in apps |
| `levelProgressFromServer`, `processServerStudentProgress`, `activityCssClass`, `resultFromStatus`, `mergeActivityResult`, `processedLevel`, `processedLessons`                                                                                   | Helpers       | Pure                                                                           |

## Usage

Compose the store per `packages/core/src/redux/README.md`:

```ts
import {injectSlices, storeHooks} from '@code-dot-org/core/redux';
import {currentUserSlice} from '@code-dot-org/users/redux';
import {
  hiddenLessonSlice,
  lessonLockSlice,
  progressSlice,
} from '@code-dot-org/progress/redux';

const store = injectSlices([
  currentUserSlice,
  progressSlice,
  hiddenLessonSlice,
  lessonLockSlice,
]);
export const {useAppDispatch, useAppSelector} = storeHooks<typeof store>();
```

Feed `initProgress` from core's parsed `Lesson`s. Ids are numbers after the
zod transform; the slice does not accept raw script JSON.

Hidden lessons and lesson locks are per section. The package does not know
which section is selected; that is teacher-dashboard's. Pass the section id
to the selectors that need it (`getLockDialogStatus`, `lessonIsVisible`,
`lessonIsLockedForAllStudents`); a participant passes none. Load them with
`getHiddenLessons(scriptName, canHideLessons)` and `loadSectionLockStatus()`.

Run validation for a level. The host wraps the lab in a
`ProgressContainer`, which puts the manager's state in the slice as
`validationState` and reports success on a script level:

```tsx
import {ProgressContainer} from '@code-dot-org/progress';

<ProgressContainer
  appType={levelProperties.appName}
  levelId={levelProperties.id}
  validations={levelProperties.validations}
  exemplarSettings={levelProperties.exemplarSettings}
>
  <MyLab />
</ProgressContainer>;
```

The lab hands the manager its validator and updates it after each run:

```ts
import {useProgressManager} from '@code-dot-org/progress';

const progressManager = useProgressManager();
useEffect(() => progressManager?.setValidator(validator), [progressManager]);
// after each run of user code:
progressManager?.updateProgress();
```

`MyValidator` extends `Validator` and decides what the level's condition
names mean; `ConditionsChecker` is one way to accumulate them. The apps
`MusicValidator` and `DanceValidator` are the reference implementations. A
lab that validates with levelbuilder-written tests uses
`TestResultValidator` over its own `ValidationTracker` instead.

The Continue button dispatches
`continueOrFinishLesson(levelProperties, {showFinishDialog})`, which records
success where Continue owns it and moves to the next level or finishes.

Time spent on a level is measured by `milestoneTimer` and sent with every
milestone post. The thunks reset it after a successful post and after an
in-page level change. The host owns the rest:

```ts
import {milestoneTimer} from '@code-dot-org/progress';

// when a lab mounts:
milestoneTimer.resetMilestoneTimer();
// from the host's idle detector:
idleDetector.on('idle', () => milestoneTimer.startIdle());
idleDetector.on('active', () => milestoneTimer.endIdle());
```

Moving between levels asks the host at each step. Two Lab2 levels share the
page by default; anything else leaves it. Install the hooks the host needs,
and the back and forward handler:

```ts
import {
  configureLevelNavigation,
  installLevelNavigationHandler,
} from '@code-dot-org/progress';

configureLevelNavigation({
  confirmNavigation: () => window.confirm('Leave with unsaved changes?'),
  onLevelChange: (from, to) => lab.switchLevel(to),
  beforeLeavingPage: () => projectManager.cleanUp(),
});
const uninstall = installLevelNavigationHandler(store, currentLevelId);
```

A later `configureLevelNavigation` call replaces only the hooks it names;
pass `undefined` to remove one.
