import {
  AnyAction,
  PayloadAction,
  ThunkAction,
  ThunkDispatch,
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit';
import $ from 'jquery';
import _ from 'lodash';

import {setVerified} from '@cdo/apps/code-studio/verifiedInstructorRedux';
import {TestResults} from '@cdo/apps/constants';
import {
  processServerStudentProgress,
  getLevelResult,
} from '@cdo/apps/templates/progress/progressHelpers';
import {
  Lesson,
  LessonGroup,
  UnitProgress,
  PeerReviewLessonInfo,
  PeerReviewSummary,
  PUZZLE_PAGE_NONE,
  InitProgressPayload,
  LevelResults,
  ViewType,
  PeerReviewLevelInfo,
} from '@cdo/apps/types/progressTypes';
import {RootState} from '@cdo/apps/types/redux';

import notifyLevelChange from '../lab2/utils/notifyLevelChange';
import {getBubbleUrl} from '../templates/progress/BubbleFactory';
import {AppDispatch} from '../util/reduxHooks';
import {navigateToHref} from '../utils';

import {mergeActivityResult} from './activityUtils';
import {
  canChangeLevelInPage,
  updateBrowserForLevelNavigation,
} from './browserNavigation';
import {authorizeLockable} from './lessonLockRedux';
import {
  getCurrentLevel,
  getCurrentScriptLevelId,
  levelById,
  nextLevelId,
} from './progressReduxSelectors';
import {SET_VIEW_TYPE} from './viewAsRedux';

export interface ProgressState {
  currentLevelId: string | null;
  currentLessonId: number | undefined;
  deeperLearningCourse: boolean | null;
  saveAnswersBeforeNavigation: boolean | null;
  lessons: Lesson[] | null;
  lessonGroups: LessonGroup[] | null;
  scriptId: number | null;
  viewAsUserId: number | null;
  scriptName: string | null;
  scriptDisplayName: string | undefined;
  unitTitle: string | null;
  courseId: number | null;
  isLessonExtras: boolean;
  unitProgress: {
    [key: number]: UnitProgress;
  };
  unitProgressHasLoaded: boolean;
  levelResults: LevelResults;
  focusAreaLessonIds: number[];
  peerReviewLessonInfo: PeerReviewLessonInfo | null;
  peerReviewsPerformed: PeerReviewSummary[];
  postMilestoneDisabled: boolean;
  isAge13Required: boolean;
  studentDefaultsSummaryView: boolean;
  isSummaryView: boolean;
  isMiniView: boolean;
  hasFullProgress: boolean;
  lessonExtrasEnabled: boolean;
  usingDbProgress: boolean;
  currentPageNumber: number;
  courseVersionId: number | undefined;
  unitDescription: string | undefined;
  unitStudentDescription: string | undefined;
  changeFocusAreaPath: string | undefined;
  unitCompleted: boolean | undefined;
  checkForUnsavedChanges: boolean | undefined;
}

export interface MilestoneReport extends OptionalMilestoneData {
  app: string;
  result: boolean;
  testResult: number;
}

interface OptionalMilestoneData {
  program?: string;
  // Submitted is a boolean, which the server expects as a string.
  submitted?: string;
}

const initialState: ProgressState = {
  currentLevelId: null,

  // These first fields never change after initialization.

  currentLessonId: undefined,
  deeperLearningCourse: null,
  // used on multi-page assessments
  saveAnswersBeforeNavigation: null,
  lessons: null,
  lessonGroups: null,
  scriptId: null,
  viewAsUserId: null,
  scriptName: null,
  scriptDisplayName: undefined,
  unitTitle: null,
  courseId: null,
  isLessonExtras: false,

  // The remaining fields do change after initialization.

  // unitProgress is of type unitProgressType (a map of levelId ->
  // studentLevelProgressType)
  unitProgress: {},
  unitProgressHasLoaded: false,
  // note: eventually, we expect usage of this field to be replaced with unitProgress
  levelResults: {},
  focusAreaLessonIds: [],
  peerReviewLessonInfo: null,
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
  courseVersionId: undefined,
  unitDescription: undefined,
  unitStudentDescription: undefined,
  changeFocusAreaPath: undefined,
  unitCompleted: undefined,
  checkForUnsavedChanges: undefined,
};

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    initProgress(state, action: PayloadAction<InitProgressPayload>) {
      const lessons = action.payload.lessons;
      // Re-initializing with full set of lessons shouldn't blow away currentLessonId
      const currentLessonId =
        state.currentLessonId ||
        (lessons.length === 1 ? lessons[0].id : undefined);
      state.currentLevelId ||= action.payload.currentLevelId;
      state.deeperLearningCourse = action.payload.deeperLearningCourse;
      state.saveAnswersBeforeNavigation =
        action.payload.saveAnswersBeforeNavigation;
      state.lessons = processedLessons(
        lessons,
        action.payload.deeperLearningCourse
      );
      state.lessonGroups = action.payload.lessonGroups;
      state.peerReviewLessonInfo = action.payload.peerReviewLessonInfo;
      state.scriptId = action.payload.scriptId;
      state.scriptName = action.payload.scriptName;
      state.scriptDisplayName = action.payload.scriptDisplayName;
      state.unitTitle = action.payload.unitTitle;
      state.unitDescription = action.payload.unitDescription;
      state.unitStudentDescription = action.payload.unitStudentDescription;
      state.courseId = action.payload.courseId;
      state.courseVersionId = action.payload.courseVersionId;
      state.currentLessonId = currentLessonId;
      state.hasFullProgress = action.payload.isFullProgress;
      state.isLessonExtras = action.payload.isLessonExtras;
      state.currentPageNumber = action.payload.currentPageNumber;
      state.checkForUnsavedChanges = action.payload.checkForUnsavedChanges;
    },
    setCurrentLevelId(state, action: PayloadAction<string>) {
      state.currentLevelId = action.payload;
    },
    setScriptProgress(
      state,
      action: PayloadAction<{
        [levelId: number]: UnitProgress;
      }>
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
          action.payload[levelId]
        );
      });
      state.levelResults = newLevelResults;
    },
    overwriteResults(state, action: PayloadAction<LevelResults>) {
      state.levelResults = action.payload;
    },
    mergePeerReviewProgress(
      state,
      action: PayloadAction<PeerReviewLevelInfo[]>
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
        }>
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
    setViewAsUserId(state, action: PayloadAction<number>) {
      state.viewAsUserId = action.payload;
    },
    setCheckForUnsavedChanges(state, action: PayloadAction<boolean>) {
      state.checkForUnsavedChanges = action.payload;
    },
  },
  extraReducers: {
    // TODO: When we convert viewAsRedux to redux-toolkit, we will need to use
    // createAction there instead of referencing the string here.
    [SET_VIEW_TYPE]: (state, action: {viewType: keyof typeof ViewType}) => {
      state.isSummaryView =
        action.viewType === ViewType.Participant &&
        state.studentDefaultsSummaryView;
    },
  },
});

// Thunks
type ProgressThunkAction = ThunkAction<void, RootState, undefined, AnyAction>;

export const queryUserProgress =
  (userId: string, mergeProgress: boolean = true): ProgressThunkAction =>
  (dispatch, getState) => {
    const state = getState().progress;
    return userProgressFromServer(state, dispatch, userId, mergeProgress);
  };

// The user has navigated to a new level in the current lesson,
// so we should update the browser and also set this as the new
// current level.
export function navigateToLevelId(levelId: string): ProgressThunkAction {
  return (dispatch, getState) => {
    const state = getState().progress;
    if (!state.currentLessonId || !state.currentLevelId) {
      return;
    }
    const newLevel = levelById(state, state.currentLessonId, levelId);
    if (!newLevel) {
      return;
    }

    const currentLevel = getCurrentLevel(getState());

    if (canChangeLevelInPage(currentLevel, newLevel)) {
      updateBrowserForLevelNavigation(state, newLevel.path, levelId);
      // Notify the Lab2 system that the level is changing.
      notifyLevelChange(currentLevel.id, levelId);
      dispatch(setCurrentLevelId(levelId));
    } else {
      const url = getBubbleUrl(newLevel.path, undefined, undefined, true);
      navigateToHref(url);
    }
  };
}

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

// The user has successfully completed the level and the page
// will not be reloading. Currently only used by Lab2 labs.
export function sendSuccessReport(appType: string): ProgressThunkAction {
  return (dispatch, getState) => {
    sendReportHelper(appType, TestResults.ALL_PASS, dispatch, getState);
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
    extraPayload
  );
});

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
    extraPayload
  );
  // Submit status isn't properly updated by just saving the status code, so re-query
  // user progress to force the bubble to update.
  thunkAPI.dispatch(
    queryUserProgress(thunkAPI.getState().currentUser.userId.toString())
  );
});

// Helpers

function sendReportHelper(
  appType: string,
  result: number,
  dispatch: ThunkDispatch<RootState, undefined, AnyAction>,
  getState: () => RootState,
  extraData?: OptionalMilestoneData
) {
  const state = getState().progress;
  const levelId = state.currentLevelId;
  if (!state.currentLessonId || !levelId) {
    return;
  }
  const scriptLevelId = getCurrentScriptLevelId(getState());
  if (!scriptLevelId) {
    return;
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

  fetch(`/milestone/${userId}/${scriptLevelId}/${levelId}`, {
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
    }
  });
}

/**
 * Requests user progress from the server and dispatches other redux actions
 * based on the server's response data.
 */
const userProgressFromServer = (
  state: ProgressState,
  dispatch: ThunkDispatch<{progress: ProgressState}, undefined, AnyAction>,
  userId: string | null = null,
  mergeProgress: boolean
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

  return $.ajax({
    url: `/api/user_progress/${state.scriptName}`,
    method: 'GET',
    data: {user_id: userId},
  }).done(data => {
    if (!data || _.isEmpty(data)) {
      return;
    }

    if (data.isVerifiedInstructor) {
      dispatch(setVerified());
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
        updateFocusArea(data.changeFocusAreaPath, data.focusAreaLessonIds)
      );
    }

    dispatch(authorizeLockable(data.lockableAuthorized));

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
        const levelResults = _.mapValues(data.progress, getLevelResult);
        dispatch(mergeResults(levelResults));
      }

      if (data.peerReviewsPerformed) {
        dispatch(mergePeerReviewProgress(data.peerReviewsPerformed));
      }

      if (data.current_lesson) {
        dispatch(setCurrentLessonId(data.current_lesson));
      }
    }
  });
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
    let lessonNumber;
    if (!isPlc && lesson.numberedLesson) {
      numLessonsWithLessonPlan++;
      lessonNumber = numLessonsWithLessonPlan;
    }
    return {
      ..._.omit(lesson, 'hidden'),
      lessonNumber,
    };
  });
}

export const {
  initProgress,
  setCurrentLevelId,
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
  setCheckForUnsavedChanges,
} = progressSlice.actions;

export default progressSlice.reducer;

// export private function(s) to expose to unit testing
export const __testonly__ = IN_UNIT_TEST
  ? {
      userProgressFromServer,
    }
  : {};
