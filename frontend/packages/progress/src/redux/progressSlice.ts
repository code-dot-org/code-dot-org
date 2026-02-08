import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import type {
  PayloadAction,
  ThunkAction,
  ThunkDispatch,
  AnyAction,
  Slice,
} from '@reduxjs/toolkit';
import _ from 'lodash';

import type {Lesson, Sublevel, UnitLevel} from '@code-dot-org/core/api';
import {LevelKinds} from '@code-dot-org/core/api';
import type {StateFor, MockStore} from '@code-dot-org/redux';
import currentUserSlice from '@code-dot-org/user/redux/currentUserSlice';

type Store = MockStore<[typeof progressSlice, typeof currentUserSlice]>;
type RootState = StateFor<Store>;
type ProgressThunkAction = ThunkAction<void, RootState, undefined, AnyAction>;
type AsyncProgressThunkAction = ThunkAction<
  Promise<void>,
  RootState,
  undefined,
  AnyAction
>;
type AppDispatch = ThunkDispatch<RootState, undefined, AnyAction>;

import {
  PUZZLE_PAGE_NONE,
  LevelStatus,
  TestResults,
  MINIMUM_PASS_RESULT,
  MINIMUM_OPTIMAL_RESULT,
} from '../constants';
import {
  LevelResults,
  PeerReviewLevelInfo,
  ProgressState,
  UnitProgress,
  UnitProgressDefinition,
  InitProgressPayload,
  ViewType,
  MilestoneReport,
  OptionalMilestoneData,
  ProgressLevelType,
  NumberedLevel,
  NumberedSublevel,
} from '../types';

/**
 * Returns the "best" of the two results, as defined in apps/src/constants.js.
 * Note that there are negative results that count as an attempt, so we can't
 * just take the maximum.
 * @returns The better result.
 */
export const mergeActivityResult: (
  a: TestResults,
  b: TestResults,
) => TestResults = (a, b) => {
  a = a || 0;
  b = b || 0;
  if (a === 0) {
    return b;
  }
  if (b === 0) {
    return a;
  }
  return Math.max(a, b);
};

export const activityCssClass: (
  result: TestResults,
) => LevelStatus = result => {
  if (!result || result === TestResults.NO_TESTS_RUN) {
    return LevelStatus.not_tried;
  }
  if (result === TestResults.REVIEW_ACCEPTED_RESULT) {
    return LevelStatus.review_accepted;
  }
  if (result === TestResults.REVIEW_REJECTED_RESULT) {
    return LevelStatus.review_rejected;
  }
  if (result === TestResults.SUBMITTED_RESULT) {
    return LevelStatus.submitted;
  }
  if (result >= MINIMUM_OPTIMAL_RESULT) {
    return LevelStatus.perfect;
  }
  if (result >= MINIMUM_PASS_RESULT) {
    return LevelStatus.passed;
  }
  return LevelStatus.attempted;
};

/**
 * Inverse of the above function.
 * Given a status string, returns a result value.
 */
export const resultFromStatus: (
  status: LevelStatus,
) => TestResults = status => {
  if (status === LevelStatus.review_accepted) {
    return TestResults.REVIEW_ACCEPTED_RESULT;
  }
  if (status === LevelStatus.review_rejected) {
    return TestResults.REVIEW_REJECTED_RESULT;
  }
  if (status === LevelStatus.submitted) {
    return TestResults.SUBMITTED_RESULT;
  }
  if (status === LevelStatus.free_play_complete) {
    return TestResults.FREE_PLAY;
  }
  if (status === LevelStatus.perfect) {
    return TestResults.ALL_PASS;
  }
  if (status === LevelStatus.passed) {
    return MINIMUM_PASS_RESULT;
  }
  return TestResults.NO_TESTS_RUN;
};

export const getLevelResult: (
  serverProgress: UnitProgressDefinition,
) => TestResults = serverProgress => {
  return serverProgress.result || resultFromStatus(serverProgress.status);
};

/**
 * Create a studentLevelProgressType object from the provided result value.
 * This is used to merge progress data from session storage which only includes
 * a result value into our data model that uses studentLevelProgressType objects.
 */
export const levelProgressFromResult: (
  result: TestResults,
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
  serverProgress: UnitProgressDefinition,
) => UnitProgress[] | undefined = serverProgress => {
  if ((serverProgress.pages_completed?.length || 0) > 1) {
    return serverProgress.pages_completed?.map((pageResult: TestResults) => {
      const pageProgress =
        (pageResult && levelProgressFromResult(pageResult)) ||
        levelProgressFromStatus(LevelStatus.not_tried);
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
  serverProgress: UnitProgressDefinition,
) => UnitProgress = serverProgress => {
  return {
    status: serverProgress.status || LevelStatus.not_tried,
    result: getLevelResult(serverProgress),
    locked: serverProgress.locked || false,
    paired: serverProgress.paired || false,
    timeSpent: serverProgress.time_spent,
    teacherFeedbackReviewState: serverProgress.teacher_feedback_review_state,
    teacherFeedbackNew: serverProgress.teacher_feedback_new || false,
    teacherFeedbackCommented:
      serverProgress.teacher_feedback_commented || false,
    lastTimestamp: serverProgress.last_progress_at,
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
  [levelId: number]: UnitProgressDefinition;
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
        [levelId: number]: UnitProgress;
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
    mergePeerReviewProgress(
      state,
      action: PayloadAction<PeerReviewLevelInfo[]>,
    ) {
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
    setViewType(state, action: PayloadAction<keyof typeof ViewType>) {
      state.isSummaryView =
        action.payload === ViewType.Participant &&
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
 */
function sendReportHelper(
  appType: string,
  result: number,
  dispatch: AppDispatch,
  getState: () => RootState,
  extraData?: OptionalMilestoneData,
) {
  const state = getState().progress;
  const levelId = state.currentLevelId;
  if (!state.currentLessonId || !levelId) {
    return Promise.resolve();
  }
  const scriptLevelId = getCurrentScriptLevelId(getState());
  if (!scriptLevelId) {
    return Promise.resolve();
  }

  // The server does not appear to use the user ID parameter,
  // so just pass 0, like some other milestone posts do.
  const userId = 0;
  extraData = extraData || {};

  const data: MilestoneReport = {
    app: appType,
    result: true,
    testResult: result,
    ...extraData,
  };

  return fetch(`/milestone/${userId}/${scriptLevelId}/${levelId}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(data),
  }).then(response => {
    if (response.ok && levelId !== null) {
      // Update the progress store by merging in this
      // particular result immediately.
      dispatch(mergeResults({[levelId]: result}));
      // If the level is the sublevel of a bubble level,
      // also update the status of the parent level.
      const currentLevel = getCurrentLevel(getState());
      if (currentLevel?.parentLevelId) {
        dispatch(mergeResults({[currentLevel.parentLevelId]: result}));
      }
    }
  });
}

// Thunks
export const getProgressLevelType: (
  state: RootState,
) => ProgressLevelType | undefined = state => {
  if (state.progress.lessons) {
    return ProgressLevelType.SCRIPT_LEVEL;
  } else if (state.progress.currentLevelId) {
    return ProgressLevelType.LEVEL;
  }
};

/**
 * Get the next level ID in the progression if it exists.
 * Returns undefined if not currently in a script level or
 * currently on the last level.
 */
export const nextLevelId: (state: RootState) => number | undefined = state => {
  if (getProgressLevelType(state) !== ProgressLevelType.SCRIPT_LEVEL) {
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
  progressData: Record<number, TestResults>,
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
  let status = LevelStatus.not_tried;
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
  }
>('progress/sendSubmitReport', async (payload, thunkAPI) => {
  const extraPayload = {
    submitted: payload.submitted.toString(),
  };
  const result = payload.submitted
    ? TestResults.SUBMITTED_RESULT
    : TestResults.UNSUBMITTED_ATTEMPT;
  await sendReportHelper(
    payload.appType,
    result,
    thunkAPI.dispatch,
    thunkAPI.getState,
    extraPayload,
  );
  // Submit status isn't properly updated by just saving the status code, so re-query
  // user progress to force the bubble to update.
  thunkAPI.dispatch(
    queryUserProgress(
      thunkAPI.getState().currentUser?.userId?.toString() || '',
    ),
  );
});

// The user has successfully completed the level and the page
// will not be reloading. Currently only used by Lab2 labs.
export function sendSuccessReport(appType: string): AsyncProgressThunkAction {
  return (dispatch, getState) => {
    return sendReportHelper(appType, TestResults.ALL_PASS, dispatch, getState);
  };
}

export const sendPredictLevelReport = createAsyncThunk<
  void,
  {appType: string; predictResponse: string},
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>('progress/sendPredictLevelReport', async (payload, thunkAPI) => {
  const extraPayload = {
    program: payload.predictResponse,
  };
  sendReportHelper(
    payload.appType,
    TestResults.CONTAINED_LEVEL_RESULT,
    thunkAPI.dispatch,
    thunkAPI.getState,
    extraPayload,
  );
});

/**
 * Requests user progress from the server and dispatches other redux actions
 * based on the server's response data.
 */
const userProgressFromServer = (
  state: ProgressState,
  dispatch: AppDispatch,
  userId: string | null = null,
  mergeProgress: boolean,
) => {
  if (!state.scriptName) {
    const message = `Could not request progress for user ID ${userId} from server: scriptName must be present in progress redux.`;
    throw new Error(message);
  }

  // If we have a userId, we can clear any progress in redux and request all progress
  // from the server.
  if (userId) {
    dispatch(clearResults());
  }

  return new Promise((resolve, reject) => {
    (async () => {
      const response = await fetch(`/api/user_progress/${state.scriptName}`, {
        body: JSON.stringify({
          user_id: userId,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        reject();
        return;
      }

      const data = await response.json();

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
        dispatch(setIsSummaryView(data.teacherViewingStudent));
      }

      if (data.focusAreaLessonIds) {
        dispatch(
          updateFocusArea(data.changeFocusAreaPath, data.focusAreaLessonIds),
        );
      }

      if (data.completed) {
        dispatch(setScriptCompleted());
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

        if (data.current_lesson) {
          dispatch(setCurrentLessonId(data.current_lesson));
        }
      }
    })();
  });
};

export const queryUserProgress =
  (userId: string, mergeProgress: boolean = true): ProgressThunkAction =>
  (dispatch, getState) => {
    const state = getState().progress;
    return userProgressFromServer(state, dispatch, userId, mergeProgress);
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
