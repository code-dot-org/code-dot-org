/**
 * Reducer and actions for progress
 */
import $ from 'jquery';
import _ from 'lodash';
import {mergeActivityResult} from './activityUtils';
import {TestResults} from '@cdo/apps/constants';
import {ViewType, SET_VIEW_TYPE} from './viewAsRedux';
import {
  processServerStudentProgress,
  getLevelResult,
} from '@cdo/apps/templates/progress/progressHelpers';
import {PUZZLE_PAGE_NONE} from '@cdo/apps/templates/progress/progressTypes';
import {setVerified} from '@cdo/apps/code-studio/verifiedInstructorRedux';
import {authorizeLockable} from './lessonLockRedux';
import {updateBrowserForLevelNavigation} from './browserNavigation';

// Action types
export const INIT_PROGRESS = 'progress/INIT_PROGRESS';
const SET_CURRENT_LEVEL_ID = 'progress/SET_CURRENT_LEVEL_ID';
const SET_UNIT_PROGRESS = 'progress/SET_UNIT_PROGRESS';
const CLEAR_RESULTS = 'progress/CLEAR_RESULTS';
const MERGE_RESULTS = 'progress/MERGE_RESULTS';
const MERGE_PEER_REVIEW_PROGRESS = 'progress/MERGE_PEER_REVIEW_PROGRESS';
const UPDATE_FOCUS_AREAS = 'progress/UPDATE_FOCUS_AREAS';
const DISABLE_POST_MILESTONE = 'progress/DISABLE_POST_MILESTONE';
const SET_IS_AGE_13_REQUIRED = 'progress/SET_IS_AGE_13_REQUIRED';
const SET_IS_SUMMARY_VIEW = 'progress/SET_IS_SUMMARY_VIEW';
const SET_IS_MINI_VIEW = 'progress/SET_IS_MINI_VIEW';
const SET_STUDENT_DEFAULTS_SUMMARY_VIEW =
  'progress/SET_STUDENT_DEFAULTS_SUMMARY_VIEW';
const SET_CURRENT_LESSON_ID = 'progress/SET_CURRENT_LESSON_ID';
const SET_UNIT_COMPLETED = 'progress/SET_UNIT_COMPLETED';
const SET_LESSON_EXTRAS_ENABLED = 'progress/SET_LESSON_EXTRAS_ENABLED';
const USE_DB_PROGRESS = 'progress/USE_DB_PROGRESS';
const OVERWRITE_RESULTS = 'progress/OVERWRITE_RESULTS';

const initialState = {
  currentLevelId: null,

  // These first fields never change after initialization
  currentLessonId: null,
  deeperLearningCourse: null,
  // used on multi-page assessments
  saveAnswersBeforeNavigation: null,
  lessons: null,
  lessonGroups: null,
  scriptId: null,
  scriptName: null,
  unitTitle: null,
  courseId: null,
  isLessonExtras: false,

  // The remaining fields do change after initialization
  // unitProgress is of type unitProgressType (a map of levelId ->
  // studentLevelProgressType)
  unitProgress: {},
  unitProgressHasLoaded: false,
  // levelResults is a map of levelId -> TestResult
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
};

/**
 * Thunks
 */

// The user has navigated to a new level in the current lesson,
// so we should update the browser and also set this as the new
// current level.
export function navigateToLevelId(levelId) {
  return (dispatch, getState) => {
    const state = getState().progress;
    const newLevel = getLevelById(
      state.lessons,
      state.currentLessonId,
      levelId
    );

    updateBrowserForLevelNavigation(state, newLevel.url, levelId);
    dispatch(setCurrentLevelId(levelId));
  };
}

// The user has successfully completed the level and the page
// will not be reloading.
export function sendSuccessReport(appType) {
  return (dispatch, getState) => {
    const state = getState().progress;
    const levelId = state.currentLevelId;
    const currentLevel = getLevelById(
      state.lessons,
      state.currentLessonId,
      levelId
    );
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
      if (response.ok) {
        // Update the progress store by merging in this
        // particular result immediately.
        dispatch(mergeResults({[levelId]: idealPassResult}));
      }
    });
  };
}

/**
 * Progress reducer
 */
export default function reducer(state = initialState, action) {
  if (action.type === INIT_PROGRESS) {
    let lessons = action.lessons;
    // Re-initializing with full set of lessons shouldn't blow away currentLessonId
    const currentLessonId =
      state.currentLessonId ||
      (lessons.length === 1 ? lessons[0].id : undefined);
    // extract fields we care about from action
    return {
      ...state,
      currentLevelId: state.currentLevelId || action.currentLevelId,
      deeperLearningCourse: action.deeperLearningCourse,
      saveAnswersBeforeNavigation: action.saveAnswersBeforeNavigation,
      lessons: processedLessons(lessons, action.deeperLearningCourse),
      lessonGroups: action.lessonGroups,
      peerReviewLessonInfo: action.peerReviewLessonInfo,
      scriptId: action.scriptId,
      scriptName: action.scriptName,
      scriptDisplayName: action.scriptDisplayName,
      unitTitle: action.unitTitle,
      unitDescription: action.unitDescription,
      unitStudentDescription: action.unitStudentDescription,
      courseId: action.courseId,
      courseVersionId: action.courseVersionId,
      currentLessonId: currentLessonId,
      hasFullProgress: action.isFullProgress,
      isLessonExtras: action.isLessonExtras,
      currentPageNumber: action.currentPageNumber,
    };
  }

  if (action.type === SET_CURRENT_LEVEL_ID) {
    return {
      ...state,
      currentLevelId: action.levelId,
    };
  }

  if (action.type === SET_UNIT_PROGRESS) {
    return {
      ...state,
      unitProgress: processServerStudentProgress(action.unitProgress),
      unitProgressHasLoaded: true,
    };
  }

  if (action.type === USE_DB_PROGRESS) {
    return {
      ...state,
      usingDbProgress: true,
    };
  }

  if (action.type === CLEAR_RESULTS) {
    return {
      ...state,
      levelResults: initialState.levelResults,
    };
  }

  if (action.type === OVERWRITE_RESULTS) {
    return {
      ...state,
      levelResults: action.levelResults,
    };
  }

  if (action.type === MERGE_RESULTS) {
    let newLevelResults = {};
    const combinedLevels = Object.keys({
      ...state.levelResults,
      ...action.levelResults,
    });
    combinedLevels.forEach(key => {
      newLevelResults[key] = mergeActivityResult(
        state.levelResults[key],
        action.levelResults[key]
      );
    });

    return {
      ...state,
      levelResults: newLevelResults,
    };
  }

  if (action.type === MERGE_PEER_REVIEW_PROGRESS) {
    return {
      ...state,
      peerReviewLessonInfo: {
        ...state.peerReviewLessonInfo,
        levels: state.peerReviewLessonInfo.levels.map((level, index) => ({
          ...level,
          ...action.peerReviewsPerformed[index],
        })),
      },
    };
  }

  if (action.type === UPDATE_FOCUS_AREAS) {
    return {
      ...state,
      changeFocusAreaPath: action.changeFocusAreaPath,
      focusAreaLessonIds: action.focusAreaLessonIds,
    };
  }

  if (action.type === DISABLE_POST_MILESTONE) {
    return {
      ...state,
      postMilestoneDisabled: true,
    };
  }

  if (action.type === SET_IS_AGE_13_REQUIRED) {
    return {
      ...state,
      isAge13Required: action.isAge13Required,
    };
  }

  if (action.type === SET_IS_SUMMARY_VIEW) {
    return {
      ...state,
      isSummaryView: action.isSummaryView,
    };
  }

  if (action.type === SET_IS_MINI_VIEW) {
    return {
      ...state,
      isMiniView: action.isMiniView,
    };
  }

  if (action.type === SET_STUDENT_DEFAULTS_SUMMARY_VIEW) {
    return {
      ...state,
      studentDefaultsSummaryView: action.studentDefaultsSummaryView,
    };
  }

  if (action.type === SET_VIEW_TYPE) {
    const {viewType} = action;
    return {
      ...state,
      isSummaryView:
        viewType === ViewType.Participant && state.studentDefaultsSummaryView,
    };
  }

  if (action.type === SET_CURRENT_LESSON_ID) {
    // if we already have a currentLessonId, that means we're on a puzzle page,
    // and we want currentLessonId to remain the same (rather than reflecting
    // the last lesson the user has made progress on).
    if (state.currentLessonId) {
      return state;
    }

    return {
      ...state,
      currentLessonId: action.lessonId,
    };
  }

  if (action.type === SET_UNIT_COMPLETED) {
    return {
      ...state,
      unitCompleted: true,
    };
  }

  if (action.type === SET_LESSON_EXTRAS_ENABLED) {
    return {
      ...state,
      lessonExtrasEnabled: action.lessonExtrasEnabled,
    };
  }

  return state;
}

// Helpers

/**
 * Does some processing of our passed in lesson, namely
 * - Removes 'hidden' field
 * - Adds 'lessonNumber' field for non-PLC lessons which
 * are not lockable or have a lesson plan
 */
export function processedLessons(lessons, isPlc) {
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

/**
 * Requests user progress from the server and dispatches other redux actions
 * based on the server's response data.
 */
const userProgressFromServer = (state, dispatch, userId = null) => {
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
function getLevelById(lessons, lessonId, levelId) {
  return lessons
    .find(lesson => lesson.id === lessonId)
    .levels.find(level => level.ids.find(id => id === levelId));
}

// Action creators
export const initProgress = ({
  currentLevelId,
  deeperLearningCourse,
  saveAnswersBeforeNavigation,
  lessons,
  lessonGroups,
  peerReviewLessonInfo,
  scriptId,
  scriptName,
  scriptDisplayName,
  unitTitle,
  unitDescription,
  unitStudentDescription,
  courseId,
  courseVersionId,
  isFullProgress,
  isLessonExtras,
  currentPageNumber,
}) => ({
  type: INIT_PROGRESS,
  currentLevelId,
  deeperLearningCourse,
  saveAnswersBeforeNavigation,
  lessons,
  lessonGroups,
  peerReviewLessonInfo,
  scriptId,
  scriptName,
  scriptDisplayName,
  unitTitle,
  unitDescription,
  unitStudentDescription,
  courseId,
  courseVersionId,
  isFullProgress,
  isLessonExtras,
  currentPageNumber,
});

export const setCurrentLevelId = levelId => ({
  type: SET_CURRENT_LEVEL_ID,
  levelId: levelId,
});

/**
 * Returns action that sets (overwrites) unitProgress in the redux store.
 *
 * @param {unitProgressType} unitProgress
 * @returns action
 */
export const setScriptProgress = unitProgress => ({
  type: SET_UNIT_PROGRESS,
  unitProgress: unitProgress,
});

export const clearResults = () => ({
  type: CLEAR_RESULTS,
});

export const useDbProgress = () => ({
  type: USE_DB_PROGRESS,
});

export const mergeResults = levelResults => ({
  type: MERGE_RESULTS,
  levelResults: levelResults,
});

export const overwriteResults = levelResults => ({
  type: OVERWRITE_RESULTS,
  levelResults: levelResults,
});

export const mergePeerReviewProgress = peerReviewsPerformed => ({
  type: MERGE_PEER_REVIEW_PROGRESS,
  peerReviewsPerformed,
});

export const updateFocusArea = (changeFocusAreaPath, focusAreaLessonIds) => ({
  type: UPDATE_FOCUS_AREAS,
  changeFocusAreaPath,
  focusAreaLessonIds,
});

export const disablePostMilestone = () => ({type: DISABLE_POST_MILESTONE});
export const setIsAge13Required = isAge13Required => ({
  type: SET_IS_AGE_13_REQUIRED,
  isAge13Required,
});
export const setIsSummaryView = isSummaryView => ({
  type: SET_IS_SUMMARY_VIEW,
  isSummaryView,
});
export const setIsMiniView = isMiniView => ({
  type: SET_IS_MINI_VIEW,
  isMiniView,
});
export const setStudentDefaultsSummaryView = studentDefaultsSummaryView => ({
  type: SET_STUDENT_DEFAULTS_SUMMARY_VIEW,
  studentDefaultsSummaryView,
});
export const setCurrentLessonId = lessonId => ({
  type: SET_CURRENT_LESSON_ID,
  lessonId,
});
export const setScriptCompleted = () => ({type: SET_UNIT_COMPLETED});
export const setLessonExtrasEnabled = lessonExtrasEnabled => ({
  type: SET_LESSON_EXTRAS_ENABLED,
  lessonExtrasEnabled,
});

export const queryUserProgress = userId => (dispatch, getState) => {
  const state = getState().progress;
  return userProgressFromServer(state, dispatch, userId);
};

// export private function(s) to expose to unit testing
export const __testonly__ = IN_UNIT_TEST
  ? {
      userProgressFromServer,
    }
  : {};
