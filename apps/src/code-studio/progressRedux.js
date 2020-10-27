/**
 * Reducer and actions for progress
 */
import $ from 'jquery';
import _ from 'lodash';
import {LevelKind} from '@cdo/apps/util/sharedConstants';
import {ViewType, SET_VIEW_TYPE} from './viewAsRedux';
import {
  mergeLevelProgressWithResult,
  levelProgressFromResult,
  processServerStudentProgress,
  processLessonGroupData
} from '@cdo/apps/templates/progress/progressHelpers';
import {setVerified} from '@cdo/apps/code-studio/verifiedTeacherRedux';
import {authorizeLockable} from './stageLockRedux';

// Action types
export const INIT_PROGRESS = 'progress/INIT_PROGRESS';
const CLEAR_PROGRESS = 'progress/CLEAR_PROGRESS';
const SET_PROGRESS = 'progress/SET_PROGRESS';
const MERGE_PROGRESS_RESULTS = 'progress/MERGE_PROGRESS_RESULTS';
const MERGE_PEER_REVIEW_PROGRESS = 'progress/MERGE_PEER_REVIEW_PROGRESS';
const UPDATE_FOCUS_AREAS = 'progress/UPDATE_FOCUS_AREAS';
const SHOW_TEACHER_INFO = 'progress/SHOW_TEACHER_INFO';
const DISABLE_POST_MILESTONE = 'progress/DISABLE_POST_MILESTONE';
const SET_IS_HOC_SCRIPT = 'progress/SET_IS_HOC_SCRIPT';
const SET_IS_AGE_13_REQUIRED = 'progress/SET_IS_AGE_13_REQUIRED';
const SET_IS_SUMMARY_VIEW = 'progress/SET_IS_SUMMARY_VIEW';
const SET_STUDENT_DEFAULTS_SUMMARY_VIEW =
  'progress/SET_STUDENT_DEFAULTS_SUMMARY_VIEW';
const SET_CURRENT_STAGE_ID = 'progress/SET_CURRENT_STAGE_ID';
const SET_SCRIPT_COMPLETED = 'progress/SET_SCRIPT_COMPLETED';
const SET_STAGE_EXTRAS_ENABLED = 'progress/SET_STAGE_EXTRAS_ENABLED';
const USE_DB_PROGRESS = 'progress/USE_DB_PROGRESS';
const OVERWRITE_PROGRESS_RESULTS = 'progress/OVERWRITE_PROGRESS_RESULTS';

const initialState = {
  // These first fields never change after initialization
  currentLevelId: null,
  currentStageId: null,
  currentLesson: null,
  professionalLearningCourse: null,
  // used on multi-page assessments
  saveAnswersBeforeNavigation: null,
  lessonGroups: null,
  scriptId: null,
  scriptName: null,
  scriptTitle: null,
  courseId: null,
  onLessonExtras: false,

  // The remaining fields do change after initialization
  // a mapping of level id to result
  progressByLevel: {},
  focusAreaStageIds: [],
  peerReviewsPerformed: [],
  showTeacherInfo: false,
  postMilestoneDisabled: false,
  isHocScript: null,
  isAge13Required: false,
  // Do students see summary view by default?
  studentDefaultsSummaryView: true,
  isSummaryView: true,
  hasFullProgress: false,
  stageExtrasEnabled: false,
  // Note: usingDbProgress === "user is logged in". However, it is
  // possible that we can get the user progress back from the DB
  // prior to having information about the user login state.
  // TODO: Use sign in state to determine where to source user progress from
  usingDbProgress: false
};

/**
 * Progress reducer
 */
export default function reducer(state = initialState, action) {
  if (action.type === INIT_PROGRESS) {
    return {
      ...state,
      currentLevelId: action.currentLevelId,
      professionalLearningCourse: action.professionalLearningCourse,
      saveAnswersBeforeNavigation: action.saveAnswersBeforeNavigation,
      lessonGroups: processLessonGroupData(
        action.stages,
        action.professionalLearningCourse,
        action.lessonGroups,
        action.peerReviewLessonInfo
      ),
      scriptId: action.scriptId,
      scriptName: action.scriptName,
      scriptTitle: action.scriptTitle,
      scriptDescription: action.scriptDescription,
      betaTitle: action.betaTitle,
      courseId: action.courseId,
      hasFullProgress: action.isFullProgress,
      onLessonExtras: action.onLessonExtras
    };
  }
  if (action.type === USE_DB_PROGRESS) {
    return {
      ...state,
      usingDbProgress: true
    };
  }
  if (action.type === CLEAR_PROGRESS) {
    return {
      ...state,
      progressByLevel: initialState.progressByLevel
    };
  }
  if (action.type === SET_PROGRESS) {
    return {
      ...state,
      progressByLevel: action.progressByLevel
    };
  }
  if (action.type === OVERWRITE_PROGRESS_RESULTS) {
    const progress = {};
    Object.entries(action.levelProgressResults).forEach(([levelId, result]) => {
      progress[levelId] = levelProgressFromResult(result);
    });
    return {
      ...state,
      progressByLevel: progress
    };
  }
  if (action.type === MERGE_PROGRESS_RESULTS) {
    const mergedProgress = {...state.progressByLevel};
    Object.entries(action.levelProgressResults).forEach(([levelId, result]) => {
      mergedProgress[levelId] = mergeLevelProgressWithResult(
        mergedProgress[levelId],
        result
      );
    });
    return {
      ...state,
      progressByLevel: mergedProgress
    };
  }
  if (action.type === MERGE_PEER_REVIEW_PROGRESS) {
    const mergedGroup = _.cloneDeep(state.lessonGroups.pop());
    const mergedProgress = {...state.progressByLevel};
    action.peerReviewsPerformed.forEach((review, index) => {
      mergedGroup.lessons[0].levels[index] = {
        id: index,
        url: review.url,
        name: review.name,
        icon: review.icon,
        levelNumber: index + 1,
        kind: LevelKind.peer_review
      };
      mergedProgress[index] = {
        status: review.status,
        result: review.result,
        paired: false
      };
    });
    return {
      ...state,
      progressByLevel: mergedProgress,
      lessonGroups: [...state.lessonGroups, mergedGroup]
    };
  }
  if (action.type === UPDATE_FOCUS_AREAS) {
    return {
      ...state,
      changeFocusAreaPath: action.changeFocusAreaPath,
      focusAreaStageIds: action.focusAreaStageIds
    };
  }
  if (action.type === SHOW_TEACHER_INFO) {
    return {
      ...state,
      showTeacherInfo: true
    };
  }
  if (action.type === DISABLE_POST_MILESTONE) {
    return {
      ...state,
      postMilestoneDisabled: true
    };
  }
  if (action.type === SET_IS_HOC_SCRIPT) {
    return {
      ...state,
      isHocScript: action.isHocScript
    };
  }
  if (action.type === SET_IS_AGE_13_REQUIRED) {
    return {
      ...state,
      isAge13Required: action.isAge13Required
    };
  }
  if (action.type === SET_IS_SUMMARY_VIEW) {
    return {
      ...state,
      isSummaryView: action.isSummaryView
    };
  }
  if (action.type === SET_STUDENT_DEFAULTS_SUMMARY_VIEW) {
    return {
      ...state,
      studentDefaultsSummaryView: action.studentDefaultsSummaryView
    };
  }
  if (action.type === SET_VIEW_TYPE) {
    const {viewType} = action;
    return {
      ...state,
      isSummaryView:
        viewType === ViewType.Student && state.studentDefaultsSummaryView
    };
  }
  if (action.type === SET_CURRENT_STAGE_ID) {
    // if we already have a currentStageId, that means we're on a puzzle page,
    // and we want currentStageId to remain the same (rather than reflecting
    // the last stage the user has made progress on).
    if (state.currentStageId) {
      return state;
    }
    return {
      ...state,
      currentStageId: action.stageId,
      currentLesson: getLesson(state, action.stageId)
    };
  }
  if (action.type === SET_SCRIPT_COMPLETED) {
    return {
      ...state,
      scriptCompleted: true
    };
  }
  if (action.type === SET_STAGE_EXTRAS_ENABLED) {
    return {
      ...state,
      stageExtrasEnabled: action.stageExtrasEnabled
    };
  }
  return state;
}

// Helpers

export const getLesson = (state, id) => {
  let foundLesson;
  for (const group of state.lessonGroups) {
    for (const lesson of group.lessons) {
      if (lesson.id === id) {
        foundLesson = lesson;
        break;
      }
    }
    if (foundLesson) {
      break;
    }
  }
  return foundLesson;
};

/**
 * Requests user progress from the server and dispatches other redux actions
 * based on the server's response data.
 */
const userProgressFromServer = (dispatch, getState, userId = null) => {
  const scriptName = getState().progress.scriptName;
  if (!scriptName) {
    const message = `Could not request progress for user ID ${userId} from server: scriptName must be present in progress redux.`;
    throw new Error(message);
  }

  // If we have a userId, we can clear any progress in redux and request all progress
  // from the server.
  if (userId) {
    dispatch(clearProgress());
  }

  return $.ajax({
    url: `/api/user_progress/${scriptName}`,
    method: 'GET',
    data: {user_id: userId}
  }).done(data => {
    data = data || {};

    if (data.isVerifiedTeacher) {
      dispatch(setVerified());
    }
    // We are on an overview page if currentLevelId is undefined.
    const onOverviewPage = !getState().progress.currentLevelId;

    // Show lesson plan links and other teacher info if teacher and on unit overview page.
    if (
      (data.isTeacher || data.teacherViewingStudent) &&
      !data.professionalLearningCourse &&
      onOverviewPage
    ) {
      // Default to summary view if teacher is viewing their student, otherwise default to detail view.
      dispatch(setIsSummaryView(data.teacherViewingStudent));
      dispatch(showTeacherInfo());
    }
    if (data.focusAreaStageIds) {
      dispatch(
        updateFocusArea(data.changeFocusAreaPath, data.focusAreaStageIds)
      );
    }
    if (data.lockableAuthorized) {
      dispatch(authorizeLockable());
    }
    if (data.completed) {
      dispatch(setScriptCompleted());
    }

    // Merge progress from server
    if (data.progress) {
      dispatch(setProgress(processServerStudentProgress(data.progress)));
      if (data.peerReviewsPerformed) {
        dispatch(mergePeerReviewProgress(data.peerReviewsPerformed));
      }
      if (data.current_stage) {
        dispatch(setCurrentStageId(data.current_stage));
      }
    }
  });
};

// Action creators
export const initProgress = ({
  currentLevelId,
  professionalLearningCourse,
  saveAnswersBeforeNavigation,
  stages,
  lessonGroups,
  peerReviewLessonInfo,
  scriptId,
  scriptName,
  scriptTitle,
  scriptDescription,
  betaTitle,
  courseId,
  isFullProgress,
  onLessonExtras
}) => ({
  type: INIT_PROGRESS,
  currentLevelId,
  professionalLearningCourse,
  saveAnswersBeforeNavigation,
  stages,
  lessonGroups,
  peerReviewLessonInfo,
  scriptId,
  scriptName,
  scriptTitle,
  scriptDescription,
  betaTitle,
  courseId,
  isFullProgress,
  onLessonExtras
});

export const clearProgress = () => ({
  type: CLEAR_PROGRESS
});

export const useDbProgress = () => ({
  type: USE_DB_PROGRESS
});

const setProgress = progressByLevel => ({
  type: SET_PROGRESS,
  progressByLevel
});

export const mergeProgressResults = levelProgressResults => ({
  type: MERGE_PROGRESS_RESULTS,
  levelProgressResults
});

export const overwriteProgressResults = levelProgressResults => ({
  type: OVERWRITE_PROGRESS_RESULTS,
  levelProgressResults
});

export const mergePeerReviewProgress = peerReviewsPerformed => ({
  type: MERGE_PEER_REVIEW_PROGRESS,
  peerReviewsPerformed
});

export const updateFocusArea = (changeFocusAreaPath, focusAreaStageIds) => ({
  type: UPDATE_FOCUS_AREAS,
  changeFocusAreaPath,
  focusAreaStageIds
});

export const showTeacherInfo = () => ({type: SHOW_TEACHER_INFO});

export const disablePostMilestone = () => ({type: DISABLE_POST_MILESTONE});

export const setIsHocScript = isHocScript => ({
  type: SET_IS_HOC_SCRIPT,
  isHocScript
});

export const setIsAge13Required = isAge13Required => ({
  type: SET_IS_AGE_13_REQUIRED,
  isAge13Required
});
export const setIsSummaryView = isSummaryView => ({
  type: SET_IS_SUMMARY_VIEW,
  isSummaryView
});
export const setStudentDefaultsSummaryView = studentDefaultsSummaryView => ({
  type: SET_STUDENT_DEFAULTS_SUMMARY_VIEW,
  studentDefaultsSummaryView
});
export const setCurrentStageId = stageId => ({
  type: SET_CURRENT_STAGE_ID,
  stageId
});
export const setScriptCompleted = () => ({type: SET_SCRIPT_COMPLETED});
export const setStageExtrasEnabled = stageExtrasEnabled => ({
  type: SET_STAGE_EXTRAS_ENABLED,
  stageExtrasEnabled
});

export const queryUserProgress = userId => {
  return (dispatch, getState) => {
    return userProgressFromServer(dispatch, getState, userId);
  };
};

// Selectors

// Do we have one or more lockable stages
export const hasLockableStages = state =>
  state.lessonGroups.some(group =>
    group.lessons.some(lesson => lesson.lockable)
  );

export const hasGroups = state => state.lessonGroups.length > 1;

export const isFocusArea = (state, lesson) =>
  state.focusAreaStageIds.includes(lesson.id);

export const levelsForCurrentLesson = state => {
  return state.currentLesson.levels;
};

export const extrasUrlForCurrentLesson = state =>
  state.stageExtrasEnabled ? state.currentLesson.lesson_extras_level_url : '';

// export private function(s) to expose to unit testing
export const __testonly__ = IN_UNIT_TEST
  ? {
      userProgressFromServer
    }
  : {};
