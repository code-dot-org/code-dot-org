import $ from 'jquery';
import _ from 'lodash';
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
import {
  AnyAction,
  PayloadAction,
  ThunkAction,
  ThunkDispatch,
  createSlice,
} from '@reduxjs/toolkit';
import {
  processServerStudentProgress,
  getLevelResult,
} from '@cdo/apps/templates/progress/progressHelpers';
import {mergeActivityResult} from './activityUtils';
import {SET_VIEW_TYPE} from './viewAsRedux';
import {setVerified} from '@cdo/apps/code-studio/verifiedInstructorRedux';
import {authorizeLockable} from './lessonLockRedux';
import {updateBrowserForLevelNavigation} from './browserNavigation';
import {TestResults} from '@cdo/apps/constants';
import {nextLevelId} from './progressReduxSelectors';

export interface ProgressState {
  currentLevelId: string | null;
  currentLessonId: number | undefined;
  deeperLearningCourse: boolean | null;
  saveAnswersBeforeNavigation: boolean | null;
  lessons: Lesson[] | null;
  lessonGroups: LessonGroup[] | null;
  scriptId: number | null;
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
type ProgressThunkAction = ThunkAction<
  void,
  {progress: ProgressState},
  undefined,
  AnyAction
>;

export const queryUserProgress =
  (userId: string): ProgressThunkAction =>
  (dispatch, getState) => {
    const state = getState().progress;
    return userProgressFromServer(state, dispatch, userId);
  };

// The user has navigated to a new level in the current lesson,
// so we should update the browser and also set this as the new
// current level.
export function navigateToLevelId(levelId: string): ProgressThunkAction {
  return (dispatch, getState) => {
    const state = getState().progress;
    if (!state.currentLessonId) {
      return;
    }
    const newLevel = getLevelById(
      state.lessons,
      state.currentLessonId,
      levelId
    );
    if (!newLevel) {
      return;
    }

    updateBrowserForLevelNavigation(state, newLevel.url, levelId);
    dispatch(setCurrentLevelId(levelId));
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
// will not be reloading.
export function sendSuccessReport(appType: string): ProgressThunkAction {
  return (dispatch, getState) => {
    const state = getState().progress;
    const levelId = state.currentLevelId;
    if (!state.currentLessonId || !levelId) {
      return;
    }
    const currentLevel = getLevelById(
      state.lessons,
      state.currentLessonId,
      levelId
    );
    if (!currentLevel) {
      return;
    }
    const scriptLevelId = currentLevel.id;

    // The server does not appear to use the user ID parameter,
    // so just pass 0, like some other milestone posts do.
    const userId = 0;

    // An ideal score.
    const idealPassResult = TestResults.ALL_PASS;

    const data = {
      app: appType,
      result: true,
      testResult: idealPassResult,
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
        dispatch(mergeResults({[levelId]: idealPassResult}));
      }
    });
  };
}

// Helpers

/**
 * Requests user progress from the server and dispatches other redux actions
 * based on the server's response data.
 */
const userProgressFromServer = (
  state: ProgressState,
  dispatch: ThunkDispatch<{progress: ProgressState}, undefined, AnyAction>,
  userId: string | null = null
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

      // Note that we set the full progress object above in redux but also set
      // a map containing just level results. This is the legacy code path and
      // the goal is to eventually update all code paths to use unitProgress
      // instead of levelResults.
      const levelResults = _.mapValues(data.progress, getLevelResult);
      dispatch(mergeResults(levelResults));

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
 * Given an array of lessons, a lesson ID, and a level ID, returns
 * the requested level.
 */
function getLevelById(
  lessons: Lesson[] | null,
  lessonId: number,
  levelId: string
) {
  const lesson = lessons?.find(lesson => lesson.id === lessonId);
  if (lesson) {
    return lesson.levels.find(level => level.ids.find(id => id === levelId));
  }
}

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
} = progressSlice.actions;

export default progressSlice.reducer;

// export private function(s) to expose to unit testing
export const __testonly__ = IN_UNIT_TEST
  ? {
      userProgressFromServer,
    }
  : {};
