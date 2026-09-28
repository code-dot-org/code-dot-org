# @code-dot-org/progress

Level progress for labs and Studio: the Lab2 validation loop
(`ProgressManager`, `ConditionsChecker`), the `progress` redux slice (unit,
lesson and level state; server progress parsing; milestone posting; in-page
level navigation), and the `TestResults` and `LevelStatuses` vocabularies
shared with Rails.

Ported from `apps/src/lab2/progress`, `apps/src/code-studio/progressRedux.ts`
and their helpers. The full compatibility assessment, including every known
divergence from `apps/` and the proposed order of work, is in
[docs/port.md](docs/port.md).

## Status

Experimental. Builds, typechecks, lints and passes its tests; nothing
consumes it yet.
Known to be broken or incomplete, so no host should depend on it before these
are addressed (details and citations in docs/port.md):

- Milestone posts omit `timeSinceLastMilestone` and `course_id`, so time spent
  and course attribution are not recorded.
- In-page navigation does not check whether both levels are Lab2, ask for
  confirmation, or notify the lab of the level change.
- `Validator.clear` lost its `isChangingLevels` argument, so the test-result
  validators used by Python Lab and Codebridge cannot be built on it yet.
- Both requests are hand-rolled `fetch` rather than `DashboardApiClient`.

Legacy (non-Lab2) labs report progress through
`apps/src/code-studio/reporting.js`. This package shares their result
vocabulary and can read their progress, but it does not replace that client;
whether it should is an open design decision (docs/port.md, section 4).

## Exports

`@code-dot-org/progress`:

| Export                                                                                                         | Kind      | Purpose                                                                              |
| -------------------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------ |
| `ProgressManager`                                                                                              | Class     | Runs a lab's `Validator` over the level's validations; reports through a callback    |
| `ConditionsChecker`                                                                                            | Class     | Accumulates satisfied conditions for a validator                                     |
| `getInitialValidationState`                                                                                    | Function  | An empty `ValidationState`                                                           |
| `TestResults`, `MINIMUM_PASS_RESULT`, `MINIMUM_OPTIMAL_RESULT`                                                 | Constants | Numeric result codes, matching `apps/src/constants.js` and Rails `ActivityConstants` |
| `LevelStatuses`, `ProgressLevelTypes`, `ViewTypes`, `PUZZLE_PAGE_NONE`, `PASSED_ALL_TESTS_VALIDATION`          | Constants |                                                                                      |
| `Validator`, `Validation`, `Condition`, `ValidationState`, `ProgressState`, `UnitProgress`, `NumberedLevel`, … | Types     |                                                                                      |

`@code-dot-org/progress/redux`:

| Export                                                                                                                                                                                               | Kind      | Purpose                                                    |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---------------------------------------------------------- |
| `progressSlice` (default)                                                                                                                                                                            | Slice     | Inject with `injectSlices` from `@code-dot-org/core/redux` |
| `initProgress`, `setCurrentLevelId`, `setScriptProgress`, `mergeResults`, …                                                                                                                          | Actions   |                                                            |
| `queryUserProgress`, `sendSuccessReport`, `sendSubmitReport`, `sendPredictLevelReport`, `navigateToLevelId`, `navigateToNextLevel`                                                                   | Thunks    | Talk to `/api/user_progress` and `/milestone`              |
| `getCurrentLevel`, `getCurrentLevels`, `getCurrentScriptLevelId`, `getParentLevel`, `getNextLevel`, `nextLevelId`, `levelsForLessonId`, `levelById`, `getProgressLevelType`, `getUserAppOptionsPath` | Selectors | Take the root state                                        |
| `levelProgressFromServer`, `processServerStudentProgress`, `activityCssClass`, `resultFromStatus`, `mergeActivityResult`, `processedLevel`, `processedLessons`                                       | Helpers   | Pure                                                       |

## Usage

Compose the store per `packages/core/src/redux/README.md`:

```ts
import {injectSlices, storeHooks} from '@code-dot-org/core/redux';
import {currentUserSlice} from '@code-dot-org/users/redux';
import {progressSlice} from '@code-dot-org/progress/redux';

const store = injectSlices([currentUserSlice, progressSlice]);
export const {useAppDispatch, useAppSelector} = storeHooks<typeof store>();
```

Feed `initProgress` from core's parsed `Lesson`s. Ids are numbers after the
zod transform; the slice does not accept raw script JSON.

Run validation for a level:

```ts
import {ProgressManager, Validator} from '@code-dot-org/progress';

const manager = new ProgressManager(() => setState(manager.getCurrentState()));
manager.setValidator(new MyValidator());
manager.onLevelChange(
  appOptions,
  levelProperties.validations,
  levelProperties.exemplarSettings,
);
// after each run of user code:
manager.updateProgress();
```

`MyValidator` extends `Validator` and decides what the level's condition
names mean; `ConditionsChecker` is one way to accumulate them. The apps
`MusicValidator` and `DanceValidator` are the reference implementations.
