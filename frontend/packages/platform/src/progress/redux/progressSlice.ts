import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import type {
  PayloadAction,
  ThunkAction,
  ThunkDispatch,
  AnyAction,
  Slice,
} from '@reduxjs/toolkit';
import _ from 'lodash';

import type {
  ApiClient,
  Lesson,
  OptionalMilestoneData,
  QueryClient,
  Sublevel,
  UnitLevel,
  // `UnitProgress` in core is the per-level wire shape after the
  // snake→camel transform. Platform also has a `UnitProgress` (this
  // file's `../types`) which is the further-normalized in-memory shape
  // with defaults filled in. Aliased here to keep both visible.
  UnitProgress as ApiUnitProgress,
} from '@code-dot-org/core/api';
import {LevelKinds} from '@code-dot-org/core/api';
import type {StateFor, MockStore} from '@code-dot-org/core/redux';
import type {currentUserSlice} from '@code-dot-org/platform/user';

/**
 * Redux-thunk `extra` shape consumed by the progress slice's async
 * thunks. Apps using this slice must configure their store with
 * `getDefaultMiddleware({thunk: {extraArgument: {apiClient, queryClient}}})`
 * so the network calls have something to dispatch through.
 */
export interface ProgressThunkExtra {
  apiClient: ApiClient;
  queryClient: QueryClient;
}

type Store = MockStore<[typeof progressSlice, typeof currentUserSlice]>;
type RootState = StateFor<Store>;
type ProgressThunkAction = ThunkAction<
  void,
  RootState,
  ProgressThunkExtra,
  AnyAction
>;
type AsyncProgressThunkAction = ThunkAction<
  Promise<void>,
  RootState,
  ProgressThunkExtra,
  AnyAction
>;
export type AppDispatch = ThunkDispatch<
  RootState,
  ProgressThunkExtra,
  AnyAction
>;

import {
  PUZZLE_PAGE_NONE,
  LevelStatuses,
  ProgressLevelTypes,
  TestResults,
  MINIMUM_PASS_RESULT,
  MINIMUM_OPTIMAL_RESULT,
  ViewTypes,
} from '../constants';
import type {
  InitProgressPayload,
  LevelResults,
  LevelStatus,
  NumberedLevel,
  NumberedSublevel,
  PeerReviewSummary,
  ProgressLevelType,
  ProgressState,
  TestResult,
  UnitProgress,
  ViewType,
} from '../types';

/**
 * Returns the "best" of the two results, as defined in apps/src/constants.js.
 * Note that there are negative results that count as an attempt, so we can't
 * just take the maximum.
 * @returns The better result.
 */
export const mergeActivityResult: (
  a: TestResult,
  b: TestResult,
) => TestResult = (a, b) => {
  a = a || 0;
  b = b || 0;
  if (a === 0) {
    return b;
  }
  if (b === 0) {
    return a;
  }
  return Math.max(a, b) as TestResult;
};

export const activityCssClass: (result: TestResult) => LevelStatus = result => {
  if (!result || result === TestResults.NO_TESTS_RUN) {
    return LevelStatuses.NotTried;
  }
  if (result === TestResults.REVIEW_ACCEPTED_RESULT) {
    return LevelStatuses.ReviewAccepted;
  }
  if (result === TestResults.REVIEW_REJECTED_RESULT) {
    return LevelStatuses.ReviewRejected;
  }
  if (result === TestResults.SUBMITTED_RESULT) {
    return LevelStatuses.Submitted;
  }
  if (result >= MINIMUM_OPTIMAL_RESULT) {
    return LevelStatuses.Perfect;
  }
  if (result >= MINIMUM_PASS_RESULT) {
    return LevelStatuses.Passed;
  }
  return LevelStatuses.Attempted;
};

/**
 * Inverse of the above function.
 * Given a status string, returns a result value.
 */
export const resultFromStatus: (status: LevelStatus) => TestResult = status => {
  if (status === LevelStatuses.ReviewAccepted) {
    return TestResults.REVIEW_ACCEPTED_RESULT;
  }
  if (status === LevelStatuses.ReviewRejected) {
    return TestResults.REVIEW_REJECTED_RESULT;
  }
  if (status === LevelStatuses.Submitted) {
    return TestResults.SUBMITTED_RESULT;
  }
  if (status === LevelStatuses.FreePlayComplete) {
    return TestResults.FREE_PLAY;
  }
  if (status === LevelStatuses.Perfect) {
    return TestResults.ALL_PASS;
  }
  if (status === LevelStatuses.Passed) {
    return MINIMUM_PASS_RESULT;
  }
  return TestResults.NO_TESTS_RUN;
};

export const getLevelResult: (
  serverProgress: ApiUnitProgress,
) => TestResult = serverProgress => {
  return (
    (serverProgress.result as TestResult) ||
    resultFromStatus(serverProgress.status as LevelStatus)
  );
};

/**
 * Create a studentLevelProgressType object from the provided result value.
 * This is used to merge progress data from session storage which only includes
 * a result value into our data model that uses studentLevelProgressType objects.
 */
export const levelProgressFromResult: (
  result: TestResult,
) => UnitProgress = result => {
  return levelProgressFromStatus(activityCssClass(result));
};

/**
 * The level object passed down to us via the server (and stored in
 * script.lessons.levels) contains more data than we need. This parses the parts
 * we care about to conform to our `NumberedLevel` object.
 */
export const processedLevel: (
  level: UnitLevel | Sublevel,
  parentLevelId?: number,
) => NumberedLevel = (level, parentLevelId) => {
  const id = (level as UnitLevel).activeId || level.id;

  return {
    ...level,
    isCurrentLevel: false,
    // Script level ID doesn't apply for sublevels. Set to undefined if we have a parent level.
    scriptLevelId: parentLevelId ? undefined : level.id,
    parentLevelId,
    levelNumber:
      (level as UnitLevel).kind === LevelKinds.Unplugged
        ? undefined
        : level.title || level.position,
    bubbleText:
      (level as UnitLevel).kind === LevelKinds.Unplugged
        ? undefined
        : (level as Sublevel).letter ||
          (level as UnitLevel).title?.toString() ||
          '',
    pageNumber:
      typeof (level as UnitLevel).pageNumber !== 'undefined'
        ? (level as UnitLevel).pageNumber
        : PUZZLE_PAGE_NONE,
    sublevels:
      (level as UnitLevel).sublevels &&
      (level as UnitLevel).sublevels?.map(sublevel =>
        processedLevel(sublevel, id),
      ),
    path: level.path,
    navigationType: parentLevelId
      ? (level as Sublevel).navigationType
      : undefined, // Only applicable for sublevels.
  } as NumberedLevel;
};

/**
 * `studentLevelProgressType.pages` is used by multi-page assessments,
 * and its presence (or absence) is how we distinguish those from single-page
 * assessments. `pages_completed` is an optional array of individual results
 * for each page (or null). Since we only have the results for the pages, we
 * need to create a `studentLevelProgressType` object from the results then
 * set the `locked` value from the parent progress.
 */
const getPagesProgress: (
  serverProgress: ApiUnitProgress,
) => UnitProgress[] | undefined = serverProgress => {
  if ((serverProgress.pagesCompleted?.length || 0) > 1) {
    return serverProgress.pagesCompleted?.map(pageResult => {
      const pageProgress =
        (pageResult && levelProgressFromResult(pageResult as TestResult)) ||
        levelProgressFromStatus(LevelStatuses.NotTried);
      pageProgress.locked = serverProgress.locked || false;
      return pageProgress;
    });
  }
};

/**
 * Parse a level progress object that we get from the server using either
 * /api/user_progress or /dashboardapi/section_level_progress into our
 * canonical studentLevelProgressType shape.
 * @param serverProgress - A progress object from the server
 * @returns Our canonical progress shape
 */
export const levelProgressFromServer: (
  serverProgress: ApiUnitProgress,
) => UnitProgress = serverProgress => {
  return {
    status: (serverProgress.status as LevelStatus) || LevelStatuses.NotTried,
    result: getLevelResult(serverProgress),
    locked: serverProgress.locked || false,
    paired: serverProgress.paired || false,
    timeSpent: serverProgress.timeSpent,
    teacherFeedbackReviewState:
      serverProgress.teacherFeedbackReviewState as UnitProgress['teacherFeedbackReviewState'],
    teacherFeedbackNew: serverProgress.teacherFeedbackNew || false,
    teacherFeedbackCommented: serverProgress.teacherFeedbackCommented || false,
    lastTimestamp: serverProgress.lastProgressAt,
    pages: getPagesProgress(serverProgress),
  };
};

/**
 * Create a studentLevelProgressType object with the provided status string
 */
export const levelProgressFromStatus: (
  status: LevelStatus,
) => UnitProgress = status => levelProgressFromServer({status: status});

/**
 * Given an object from the server with student progress data keyed by level ID,
 * parse the progress data into our canonical studentLevelProgressType
 * @param {{[levelId: number]:serverProgress}} serverStudentProgress
 * @returns {{[levelId: number]:studentLevelProgressType}}
 */
export const processServerStudentProgress: (serverStudentProgress: {
  [levelId: number]: ApiUnitProgress;
}) => {
  [levelId: number]: UnitProgress;
} = serverStudentProgress => {
  return _.mapValues(serverStudentProgress, progress =>
    levelProgressFromServer(progress),
  );
};

/**
 * Does some processing of our passed in lesson, namely
 * - Removes 'hidden' field
 * - Adds 'lessonNumber' field for non-PLC lessons which
 * are not lockable or have a lesson plan
 */
export function processedLessons(lessons: Lesson[], isPlc: boolean) {
  let numLessonsWithLessonPlan = 0;

  return lessons.map(lesson => {
    let lessonNumber: number | undefined;
    if (!isPlc && lesson.numberedLesson) {
      numLessonsWithLessonPlan++;
      lessonNumber = numLessonsWithLessonPlan;
    }
    return {
      ...lesson,
      hidden: false,
      lessonNumber,
    };
  });
}

const initialState: ProgressState = {
  // These first fields never change after initialization.
  isLessonExtras: false,

  // The remaining fields do change after initialization.

  // unitProgress is of type unitProgressType (a map of levelId ->
  // studentLevelProgressType)
  unitProgress: {},
  unitProgressHasLoaded: false,
  // note: eventually, we expect usage of this field to be replaced with unitProgress
  levelResults: {},
  focusAreaLessonIds: [],
  peerReviewsPerformed: [],
  postMilestoneDisabled: false,
  isAge13Required: false,
  // Do students see summary view by default?
  studentDefaultsSummaryView: true,
  isSummaryView: true,
  isMiniView: false,
  hasFullProgress: false,
  lessonExtrasEnabled: false,
  // Note: usingDbProgress === "user is logged in". However, it is
  // possible that we can get the user progress back from the DB
  // prior to having information about the user login state.
  // TODO: Use sign in state to determine where to source user progress from
  usingDbProgress: false,
  currentPageNumber: PUZZLE_PAGE_NONE,
  unitHasUnnumberedLessons: false,
};

const _progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    initProgress(state, action: PayloadAction<InitProgressPayload>) {
      const lessons = action.payload.lessons;
      // Re-initializing with full set of lessons shouldn't blow away currentLessonId
      const currentLessonId: number | undefined =
        state.currentLessonId ||
        (lessons.length === 1 ? lessons[0].id : undefined);
      state.currentLevelId ||= action.payload.currentLevelId;
      state.standaloneProjectType ||= action.payload.standaloneProjectType;
      state.deeperLearningCourse = action.payload.deeperLearningCourse;
      state.saveAnswersBeforeNavigation =
        action.payload.saveAnswersBeforeNavigation;
      state.lessons = processedLessons(
        lessons,
        action.payload.deeperLearningCourse,
      );
      state.lessonGroups = action.payload.lessonGroups;
      state.peerReviewLessonInfo = action.payload.peerReviewLessonInfo;
      state.scriptId = action.payload.scriptId;
      state.scriptName = action.payload.scriptName;
      state.scriptDisplayName = action.payload.scriptDisplayName;
      state.unitTitle = action.payload.unitTitle;
      state.unitDescription = action.payload.unitDescription;
      state.unitStudentDescription = action.payload.unitStudentDescription;
      state.unitHasUnnumberedLessons = action.payload.unitHasUnnumberedLessons;
      state.courseId = action.payload.courseId;
      state.courseVersionId = action.payload.courseVersionId;
      state.currentLessonId = currentLessonId;
      state.hasFullProgress = action.payload.isFullProgress;
      state.isLessonExtras = action.payload.isLessonExtras;
      state.currentPageNumber = action.payload.currentPageNumber;
    },
    setCurrentLevelId(state, action: PayloadAction<number>) {
      state.currentLevelId = action.payload;
    },
    setStandaloneProjectType(state, action: PayloadAction<string>) {
      state.standaloneProjectType = action.payload;
    },
    setScriptProgress(
      state,
      action: PayloadAction<{
        [levelId: number]: ApiUnitProgress;
      }>,
    ) {
      state.unitProgress = processServerStudentProgress(action.payload);
      state.unitProgressHasLoaded = true;
    },
    clearResults(state) {
      state.levelResults = initialState.levelResults;
    },
    useDbProgress(state) {
      state.usingDbProgress = true;
    },
    mergeResults(state, action: PayloadAction<LevelResults>) {
      const newLevelResults: LevelResults = {};
      const combinedLevels = Object.keys({
        ...state.levelResults,
        ...action.payload,
      });
      combinedLevels.forEach(key => {
        const levelId = parseInt(key);
        newLevelResults[levelId] = mergeActivityResult(
          state.levelResults[levelId],
          action.payload[levelId],
        );
      });
      state.levelResults = newLevelResults;
    },
    overwriteResults(state, action: PayloadAction<LevelResults>) {
      state.levelResults = action.payload;
    },
    mergePeerReviewProgress(state, action: PayloadAction<PeerReviewSummary[]>) {
      // The action payload is the wire-shape summary (status/name/result
      // /icon/locked). Spreading it onto each existing level updates
      // those fields and preserves the level's id/kind/title/url.
      if (state.peerReviewLessonInfo) {
        state.peerReviewLessonInfo = {
          ...state.peerReviewLessonInfo,
          levels: state.peerReviewLessonInfo.levels.map((level, index) => ({
            ...level,
            ...action.payload[index],
          })),
        };
      }
    },
    updateFocusArea: {
      reducer(
        state,
        action: PayloadAction<{
          changeFocusAreaPath: string;
          focusAreaLessonIds: number[];
        }>,
      ) {
        state.changeFocusAreaPath = action.payload.changeFocusAreaPath;
        state.focusAreaLessonIds = action.payload.focusAreaLessonIds;
      },
      prepare(changeFocusAreaPath: string, focusAreaLessonIds: number[]) {
        return {
          payload: {
            changeFocusAreaPath,
            focusAreaLessonIds,
          },
        };
      },
    },
    disablePostMilestone(state) {
      state.postMilestoneDisabled = true;
    },
    setIsAge13Required(state, action: PayloadAction<boolean>) {
      state.isAge13Required = action.payload;
    },
    setIsSummaryView(state, action: PayloadAction<boolean>) {
      state.isSummaryView = action.payload;
    },
    setIsMiniView(state, action: PayloadAction<boolean>) {
      state.isMiniView = action.payload;
    },
    setStudentDefaultsSummaryView(state, action: PayloadAction<boolean>) {
      state.studentDefaultsSummaryView = action.payload;
    },
    setCurrentLessonId(state, action: PayloadAction<number>) {
      // if we already have a currentLessonId, that means we're on a puzzle page,
      // and we want currentLessonId to remain the same (rather than reflecting
      // the last lesson the user has made progress on).
      if (!state.currentLessonId) {
        state.currentLessonId = action.payload;
      }
    },
    setScriptCompleted(state) {
      state.unitCompleted = true;
    },
    setLessonExtrasEnabled(state, action: PayloadAction<boolean>) {
      state.lessonExtrasEnabled = action.payload;
    },
    setViewAsUserId(state, action: PayloadAction<number | undefined>) {
      state.viewAsUserId = action.payload;
    },
    setViewType(state, action: PayloadAction<ViewType>) {
      state.isSummaryView =
        action.payload === ViewTypes.Participant &&
        state.studentDefaultsSummaryView;
    },
  },
});

const progressSlice: Slice<ProgressState> = _progressSlice;

/**
 * Get the script level ID of the current level. If the current level is a sublevel,
 * (and therefore not a script level) return the parent script level ID.
 * Returns undefined if there is no current level.
 */
export const getCurrentScriptLevelId: (
  state: RootState,
) => number | undefined = state => {
  const currentLevel = getCurrentLevel(state);
  if (!currentLevel) {
    return;
  }

  const currentSublevel = currentLevel as NumberedSublevel;

  if (currentSublevel.parentLevelId) {
    return levelById(
      state.progress,
      state.progress.currentLessonId,
      currentSublevel.parentLevelId,
    )?.scriptLevelId;
  } else {
    return currentLevel.scriptLevelId;
  }
};

/**
 * Returns the dashboard URL path to retrieve the user app options for a script level.
 * If we don't have a current level, this returns undefined.
 */
export const getUserAppOptionsPath: (
  state: RootState,
) => string | undefined = state => {
  if (state.progress.lessons) {
    const scriptName = state.progress.scriptName;

    const lessonPosition = state.progress.lessons?.find(
      lesson => lesson.id === state.progress.currentLessonId,
    )?.relativePosition;

    const currentLevel = getCurrentLevel(state);
    if (!currentLevel) {
      return undefined;
    }

    const levelPosition = currentLevel.levelNumber;

    const levelId = state.progress.currentLevelId;

    return `/api/user_app_options/${scriptName}/${lessonPosition}/${levelPosition}/${levelId}`;
  } else {
    return undefined;
  }
};

/**
 * Given a lesson ID, and a level ID, returns the requested level.
 */
export const levelById: (
  state: RootState['progress'],
  lessonId: number | undefined,
  levelId: number,
) => NumberedLevel | undefined = (state, lessonId, levelId) => {
  return levelsForLessonId(state, lessonId)
    ?.flatMap(level => [level, ...(level?.sublevels || [])])
    ?.find(level => level.id === levelId);
};

/**
 * Helper method to send the milestone report to the backend API.
 * Posts via `apiClient.progress.reportMilestone` and merges the result
 * into redux on success. Errors propagate to the caller (the createAsync
 * thunks below), where redux-toolkit captures them as rejected actions.
 *
 * @returns `true` if a report was actually sent, `false` if the call
 * bailed early because the redux state didn't have enough context
 * (no current lesson, no current level, or no resolvable scriptLevelId).
 * Callers use this to decide whether follow-up dispatches make sense —
 * e.g. `sendSubmitReport` skips its `queryUserProgress` re-query when
 * nothing was sent.
 */
async function sendReportHelper(
  apiClient: ApiClient,
  appType: string,
  result: TestResult,
  dispatch: AppDispatch,
  getState: () => RootState,
  extraData?: OptionalMilestoneData,
): Promise<boolean> {
  const state = getState().progress;
  const levelId = state.currentLevelId;
  if (!state.currentLessonId || !levelId) {
    return false;
  }
  const scriptLevelId = getCurrentScriptLevelId(getState());
  if (!scriptLevelId) {
    return false;
  }

  // The server does not appear to use the user ID parameter,
  // so just pass 0, like some other milestone posts do.
  await apiClient.progress.reportMilestone({
    userId: 0,
    scriptLevelId,
    levelId,
    app: appType,
    testResult: result,
    extraData,
  });

  // Update the progress store by merging in this particular result
  // immediately so the bubble updates before the next user-progress
  // refetch.
  dispatch(mergeResults({[levelId]: result}));

  // If the level is the sublevel of a bubble level, also update the
  // status of the parent level.
  const currentLevel = getCurrentLevel(getState());
  if (currentLevel?.parentLevelId) {
    dispatch(mergeResults({[currentLevel.parentLevelId]: result}));
  }

  return true;
}

// Thunks
export const getProgressLevelType: (
  state: RootState,
) => ProgressLevelType | undefined = state => {
  if (state.progress.lessons) {
    return ProgressLevelTypes.ScriptLevel;
  } else if (state.progress.currentLevelId) {
    return ProgressLevelTypes.Level;
  }
};

/**
 * Get the next level ID in the progression if it exists.
 * Returns undefined if not currently in a script level or
 * currently on the last level.
 */
export const nextLevelId: (state: RootState) => number | undefined = state => {
  if (getProgressLevelType(state) !== ProgressLevelTypes.ScriptLevel) {
    return;
  }

  const levels = levelsForLessonId(
    state.progress,
    state.progress.currentLessonId,
  );
  const currentLevel = getCurrentLevel(state);
  // If we are on a sublevel, navigate back to the parent level.
  if (currentLevel?.parentLevelId) {
    return currentLevel.parentLevelId;
  }
  const currentLevelIndex = (currentLevel?.levelNumber || 0) - 1;
  if (currentLevelIndex === levels.length - 1) {
    return;
  }

  const nextLevel = levels[currentLevelIndex + 1];
  return nextLevel.id;
};

// Navigate to the next level in the progression, if it exists.
export function navigateToNextLevel(): ProgressThunkAction {
  return (dispatch, getState) => {
    const levelId = nextLevelId(getState());
    if (levelId === undefined) {
      return;
    }
    dispatch(navigateToLevelId(levelId));
  };
}

/**
 * Return the level with the highest progress, or the first level if none have
 * been attempted
 * @param progressData - Mapping from level id to progress result
 */
export const bestResultLevelId: (
  levelIds: number[],
  progressData: Record<number, TestResult>,
) => number = (levelIds, progressData) => {
  // The usual case
  if (levelIds.length === 1) {
    return levelIds[0];
  }

  // Return the level with the highest result
  const attemptedIds = levelIds.filter(id => progressData[id]);
  if (attemptedIds.length === 0) {
    // None of them have been attempted, just return the first
    return levelIds[0];
  }
  let bestId = attemptedIds[0];
  let bestResult = progressData[bestId];
  attemptedIds.forEach(function (id) {
    const result = progressData[id];
    if (result > bestResult) {
      bestId = id;
      bestResult = result;
    }
  });
  return bestId;
};

/**
 * The level object passed down to use via the server (and stored in lesson.lessons.levels)
 * contains more data than we need. This (a) filters to the parts our views care
 * about and (b) determines current status based on the current state of
 * state.levelResults
 */
const levelWithProgress: (
  state: Pick<
    RootState['progress'],
    'unitProgress' | 'levelResults' | 'currentLevelId'
  > & {
    levelPairing?: {
      [key: string]: boolean;
    };
  },
  level: NumberedLevel,
  isLockable: boolean,
  parentLevelId?: number,
) => NumberedLevel = (
  {levelResults, unitProgress, levelPairing = {}, currentLevelId},
  level,
  isLockable,
  parentLevelId,
) => {
  const normalizedLevel = processedLevel(level, parentLevelId);
  if (level.ids) {
    // make sure we're using the id with best progress
    normalizedLevel.id = bestResultLevelId(level.ids, levelResults);
  }

  // default values
  let status: LevelStatus = LevelStatuses.NotTried;
  let locked = isLockable;
  let teacherFeedbackReviewState = null;

  let levelProgress = unitProgress[normalizedLevel.id || 0];
  if (levelProgress?.pages) {
    levelProgress =
      levelProgress.pages[((normalizedLevel as UnitLevel).pageNumber || 0) - 1];
  }
  if (levelProgress) {
    // if we have levelProgress, overwrite default values
    status = levelProgress.status;
    locked = levelProgress.locked;
    teacherFeedbackReviewState = levelProgress.teacherFeedbackReviewState;
  } else if (
    !(
      (level as UnitLevel).kind === LevelKinds.Assessment &&
      (level as UnitLevel).app === 'level_group'
    )
  ) {
    // if we don't have levelProgress, get the status from `levelResults`.
    // however, `levelResults` doesn't track per-page results for multi-page
    // assessments, so for assessments we leave default values.
    //
    // note: if we're not using levelProgress, `isLocked` will always be false.
    status = activityCssClass(levelResults[normalizedLevel?.id || 0]);
  }
  const isCurrent =
    normalizedLevel.id === currentLevelId ||
    (currentLevelId !== undefined && !!level.ids?.includes(currentLevelId));

  return {
    ...normalizedLevel,
    status: status,
    isCurrentLevel: isCurrent,
    paired: levelPairing[(level.activeId || 0).toString()],
    isLocked: locked,
    teacherFeedbackReviewState: teacherFeedbackReviewState,
    sublevels: level.sublevels?.map((sublevel: NumberedLevel, i: number) =>
      levelWithProgress(
        {levelResults, unitProgress, levelPairing, currentLevelId},
        {
          ...sublevel,
          levelNumber: i,
          isCurrentLevel: false,
        },
        isLockable,
        normalizedLevel.id,
      ),
    ),
  } as NumberedLevel;
};

/**
 * Get data for a particular lesson
 */
export const levelsForLessonId: (
  state: RootState['progress'],
  lessonId: number | undefined,
) => NumberedLevel[] = (state, lessonId) => {
  const lesson = state.lessons?.find(lesson => lesson.id === lessonId);
  return (lesson?.levels || []).map((lessonLevel, i) =>
    levelWithProgress(
      state,
      {
        ...(lessonLevel || {
          key: '',
        }),
        ids: lessonLevel?.ids || [lessonLevel.id || 0],
        activeId: lessonLevel?.activeId || -1,
        sublevels: (lessonLevel.sublevels || []).map((sublevel, j) => ({
          ids: [sublevel.id || 0],
          activeId: -1,
          ...(sublevel || {
            key: '',
          }),
          levelNumber: j,
          isCurrentLevel: false,
        })) as NumberedLevel[],
        levelNumber: i,
        isCurrentLevel: false,
      } as NumberedLevel,
      lesson?.lockable || false,
    ),
  );
};

export const getCurrentLevels: (
  state: RootState,
) => NumberedLevel[] = state => {
  return levelsForLessonId(state.progress, state.progress.currentLessonId);
};

export const getCurrentLevel: (
  state: RootState,
) => NumberedLevel | undefined = state => {
  return getCurrentLevels(state)
    ?.flatMap(level => [level, ...(level?.sublevels || [])])
    ?.find(level => level.isCurrentLevel);
};

// If we are on a new level without doing a page reload, then we should set the title
// to match what levels_helper.rb's level_title function would have done.
export const setWindowTitle: (
  progressStoreState: RootState['progress'],
  newLevelId: number,
) => void = (progressStoreState, newLevelId) => {
  const lesson = progressStoreState.lessons?.find(
    lesson => lesson.id === progressStoreState.currentLessonId,
  );
  const numLessons = lesson?.levels?.length || 0;
  const lessonName = lesson?.title || 'Lesson';
  const lessonIndex =
    (lesson?.levels || []).findIndex(
      lessonLevel => lessonLevel.position === newLevelId,
    ) + 1;
  const scriptDisplayName = progressStoreState.scriptDisplayName;

  document.title =
    numLessons > 1
      ? `${lessonName} #${lessonIndex} | ${scriptDisplayName} - Code.org`
      : `${lessonName} #${lessonIndex} - Code.org`;
};

// Handles a user navigation to a new level, by pushing this new level's URL
// onto the browser session history stack, and updating the window title.
export const updateBrowserForLevelNavigation: (
  progressStoreState: RootState['progress'],
  levelPath: string,
  levelId: number,
) => void = (progressStoreState, levelPath, levelId) => {
  window.history.pushState({levelId}, '', levelPath + window.location.search);
  setWindowTitle(progressStoreState, levelId);
};

// The user has navigated to a new level in the current lesson,
// so we should update the browser and also set this as the new
// current level.
export function navigateToLevelId(levelId: number): ProgressThunkAction {
  return async (dispatch, getState) => {
    const state = getState().progress;
    if (!state.currentLessonId || !state.currentLevelId) {
      return;
    }
    const newLevel = levelById(state, state.currentLessonId, levelId);
    if (!newLevel) {
      return;
    }

    // If the requested level is the same as the current level, don't do anything.
    if (state.currentLevelId === levelId) {
      return;
    }
    updateBrowserForLevelNavigation(state, newLevel.url, levelId);
    dispatch(setCurrentLevelId(levelId));
  };
}

export const sendSubmitReport = createAsyncThunk<
  void,
  {appType: string; submitted: boolean},
  {
    dispatch: AppDispatch;
    state: RootState;
    extra: ProgressThunkExtra;
  }
>('progress/sendSubmitReport', async (payload, thunkAPI) => {
  const extraPayload = {
    submitted: payload.submitted.toString(),
  };
  const result = payload.submitted
    ? TestResults.SUBMITTED_RESULT
    : TestResults.UNSUBMITTED_ATTEMPT;
  const sent = await sendReportHelper(
    thunkAPI.extra.apiClient,
    payload.appType,
    result,
    thunkAPI.dispatch,
    thunkAPI.getState,
    extraPayload,
  );
  // Submit status isn't properly updated by just saving the status code,
  // so re-query user progress to force the bubble to update — but only
  // when the milestone actually went out. A pre-flight bail (missing
  // lesson/level/scriptLevelId) means there's nothing on the server
  // worth refetching.
  if (sent) {
    thunkAPI.dispatch(
      queryUserProgress(
        thunkAPI.getState().currentUser?.userId?.toString() || '',
      ),
    );
  }
});

// The user has successfully completed the level and the page
// will not be reloading. Currently only used by Lab2 labs.
//
// The thunk return type is `Promise<void>` (per `AsyncProgressThunkAction`),
// so we drop sendReportHelper's did-send boolean here — only the submit
// path uses it to gate a follow-up re-query.
export function sendSuccessReport(appType: string): AsyncProgressThunkAction {
  return async (dispatch, getState, extra) => {
    await sendReportHelper(
      extra.apiClient,
      appType,
      TestResults.ALL_PASS,
      dispatch,
      getState,
    );
  };
}

export const sendPredictLevelReport = createAsyncThunk<
  void,
  {appType: string; predictResponse: string},
  {
    dispatch: AppDispatch;
    state: RootState;
    extra: ProgressThunkExtra;
  }
>('progress/sendPredictLevelReport', async (payload, thunkAPI) => {
  const extraPayload = {
    program: payload.predictResponse,
  };
  await sendReportHelper(
    thunkAPI.extra.apiClient,
    payload.appType,
    TestResults.CONTAINED_LEVEL_RESULT,
    thunkAPI.dispatch,
    thunkAPI.getState,
    extraPayload,
  );
});

/**
 * Requests user progress from the server and dispatches other redux actions
 * based on the server's response data. Reads from `api.progress.getUserProgress`,
 * which validates the response against `UserProgressResponseSchema` and
 * returns the camelCase consumer shape.
 */
async function userProgressFromServer(
  apiClient: ApiClient,
  state: ProgressState,
  dispatch: AppDispatch,
  userId: string | null = null,
  mergeProgress: boolean,
): Promise<void> {
  if (!state.scriptName) {
    throw new Error(
      `Could not request progress for user ID ${userId} from server: scriptName must be present in progress redux.`,
    );
  }

  // If we have a userId, we can clear any progress in redux and request all progress
  // from the server.
  if (userId) {
    dispatch(clearResults());
  }

  const data = await apiClient.progress.getUserProgress({
    scriptName: state.scriptName,
    // Callers pass an empty string when there is no logged-in user (see
    // `sendSubmitReport` above). Treat that as "no userId" so the query
    // param is absent rather than `?user_id=`.
    userId: userId || undefined,
  });

  if (!data || _.isEmpty(data)) {
    return;
  }

  // We are on an overview page if currentLevelId is undefined.
  const onOverviewPage = !state.currentLevelId;
  // Show lesson plan links and other teacher info if instructor and on unit overview page.
  if (
    (data.isInstructor || data.teacherViewingStudent) &&
    !data.deeperLearningCourse &&
    onOverviewPage
  ) {
    // Default to summary view if teacher is viewing their student, otherwise default to detail view.
    dispatch(setIsSummaryView(!!data.teacherViewingStudent));
  }

  if (data.focusAreaLessonIds && data.changeFocusAreaPath) {
    dispatch(
      updateFocusArea(data.changeFocusAreaPath, data.focusAreaLessonIds),
    );
  }

  if (data.completed) {
    dispatch(setScriptCompleted());
    return;
  }

  // Merge progress from server
  if (data.progress) {
    dispatch(setScriptProgress(data.progress));

    if (mergeProgress) {
      // Note that we set the full progress object above in redux but also set
      // a map containing just level results. This is the legacy code path and
      // the goal is to eventually update all code paths to use unitProgress
      // instead of levelResults.
      const levelResults: LevelResults = _.mapValues(
        data.progress,
        getLevelResult,
      ) as unknown as LevelResults;
      dispatch(mergeResults(levelResults));
    }

    if (data.peerReviewsPerformed) {
      dispatch(mergePeerReviewProgress(data.peerReviewsPerformed));
    }

    if (data.currentLesson !== undefined) {
      dispatch(setCurrentLessonId(data.currentLesson));
    }
  }
}

export const queryUserProgress =
  (userId: string, mergeProgress: boolean = true): AsyncProgressThunkAction =>
  (dispatch, getState, extra) => {
    const state = getState().progress;
    return userProgressFromServer(
      extra.apiClient,
      state,
      dispatch,
      userId,
      mergeProgress,
    );
  };

export const {
  initProgress,
  setCurrentLevelId,
  setStandaloneProjectType,
  setScriptProgress,
  clearResults,
  useDbProgress,
  mergeResults,
  overwriteResults,
  mergePeerReviewProgress,
  updateFocusArea,
  disablePostMilestone,
  setIsAge13Required,
  setIsSummaryView,
  setIsMiniView,
  setStudentDefaultsSummaryView,
  setCurrentLessonId,
  setScriptCompleted,
  setLessonExtrasEnabled,
  setViewAsUserId,
  setViewType,
} = _progressSlice.actions;
export default progressSlice;
