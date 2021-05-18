/**
 * Reducer and actions for progress
 */
import $ from 'jquery';
import _ from 'lodash';
import {mergeActivityResult, activityCssClass} from './activityUtils';
import {LevelStatus, LevelKind} from '@cdo/apps/util/sharedConstants';
import {TestResults} from '@cdo/apps/constants';
import {ViewType, SET_VIEW_TYPE} from './viewAsRedux';
import {
  processedLevel,
  processServerStudentProgress,
  getLevelResult
} from '@cdo/apps/templates/progress/progressHelpers';
import {PUZZLE_PAGE_NONE} from '@cdo/apps/templates/progress/progressTypes';
import {setVerified} from '@cdo/apps/code-studio/verifiedTeacherRedux';
import {authorizeLockable} from './lessonLockRedux';

// Action types
export const INIT_PROGRESS = 'progress/INIT_PROGRESS';
const SET_SCRIPT_PROGRESS = 'progress/SET_SCRIPT_PROGRESS';
const CLEAR_RESULTS = 'progress/CLEAR_RESULTS';
const MERGE_RESULTS = 'progress/MERGE_RESULTS';
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
const OVERWRITE_RESULTS = 'progress/OVERWRITE_RESULTS';

const PEER_REVIEW_ID = -1;

const initialState = {
  // These first fields never change after initialization
  currentLevelId: null,
  currentStageId: null,
  professionalLearningCourse: null,
  // used on multi-page assessments
  saveAnswersBeforeNavigation: null,
  stages: null,
  lessonGroups: null,
  scriptId: null,
  scriptName: null,
  scriptTitle: null,
  courseId: null,
  isLessonExtras: false,

  // The remaining fields do change after initialization
  // scriptProgress is of type scriptProgressType (a map of levelId ->
  // studentLevelProgressType)
  scriptProgress: {},
  // levelResults is a map of levelId -> TestResult
  // note: eventually, we expect usage of this field to be replaced with scriptProgress
  levelResults: {},
  focusAreaStageIds: [],
  peerReviewLessonInfo: null,
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
  usingDbProgress: false,
  currentPageNumber: PUZZLE_PAGE_NONE
};

/**
 * Progress reducer
 */
export default function reducer(state = initialState, action) {
  if (action.type === INIT_PROGRESS) {
    let stages = action.stages;
    // Re-initializing with full set of stages shouldn't blow away currentStageId
    const currentStageId =
      state.currentStageId || (stages.length === 1 ? stages[0].id : undefined);
    // extract fields we care about from action
    return {
      ...state,
      currentLevelId: action.currentLevelId,
      professionalLearningCourse: action.professionalLearningCourse,
      saveAnswersBeforeNavigation: action.saveAnswersBeforeNavigation,
      stages: processedStages(stages, action.professionalLearningCourse),
      lessonGroups: action.lessonGroups,
      peerReviewLessonInfo: action.peerReviewLessonInfo,
      scriptId: action.scriptId,
      scriptName: action.scriptName,
      scriptTitle: action.scriptTitle,
      scriptDescription: action.scriptDescription,
      scriptStudentDescription: action.scriptStudentDescription,
      betaTitle: action.betaTitle,
      courseId: action.courseId,
      currentStageId,
      hasFullProgress: action.isFullProgress,
      isLessonExtras: action.isLessonExtras,
      currentPageNumber: action.currentPageNumber
    };
  }

  if (action.type === SET_SCRIPT_PROGRESS) {
    return {
      ...state,
      scriptProgress: processServerStudentProgress(action.scriptProgress)
    };
  }

  if (action.type === USE_DB_PROGRESS) {
    return {
      ...state,
      usingDbProgress: true
    };
  }

  if (action.type === CLEAR_RESULTS) {
    return {
      ...state,
      levelResults: initialState.levelResults
    };
  }

  if (action.type === OVERWRITE_RESULTS) {
    return {
      ...state,
      levelResults: action.levelResults
    };
  }

  if (action.type === MERGE_RESULTS) {
    let newLevelResults = {};
    const combinedLevels = Object.keys({
      ...state.levelResults,
      ...action.levelResults
    });
    combinedLevels.forEach(key => {
      newLevelResults[key] = mergeActivityResult(
        state.levelResults[key],
        action.levelResults[key]
      );
    });

    return {
      ...state,
      levelResults: newLevelResults
    };
  }

  if (action.type === MERGE_PEER_REVIEW_PROGRESS) {
    return {
      ...state,
      peerReviewLessonInfo: {
        ...state.peerReviewLessonInfo,
        levels: state.peerReviewLessonInfo.levels.map((level, index) => ({
          ...level,
          ...action.peerReviewsPerformed[index]
        }))
      }
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
      currentStageId: action.stageId
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

/**
 * Return the level with the highest progress, or the first level if none have
 * been attempted
 * @param {number[]} levelIds
 * @param {Object.<number,number>} - Mapping from level id to progress result
 */
function bestResultLevelId(levelIds, progressData) {
  // The usual case
  if (levelIds.length === 1) {
    return levelIds[0];
  }

  // Return the level with the highest result
  var attemptedIds = levelIds.filter(id => progressData[id]);
  if (attemptedIds.length === 0) {
    // None of them have been attempted, just return the first
    return levelIds[0];
  }
  var bestId = attemptedIds[0];
  var bestResult = progressData[bestId];
  attemptedIds.forEach(function(id) {
    var result = progressData[id];
    if (result > bestResult) {
      bestId = id;
      bestResult = result;
    }
  });
  return bestId;
}

/**
 * Does some processing of our passed in lesson, namely
 * - Removes 'hidden' field
 * - Adds 'stageNumber' field for non-PLC lessons which
 * are not lockable or have a lesson plan
 */
export function processedStages(lessons, isPlc) {
  let numLessonsWithLessonPlan = 0;

  return lessons.map(lesson => {
    let stageNumber;
    if (!isPlc && lesson.numberedLesson) {
      numLessonsWithLessonPlan++;
      stageNumber = numLessonsWithLessonPlan;
    }
    return {
      ..._.omit(lesson, 'hidden'),
      stageNumber
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
    data: {user_id: userId}
  }).done(data => {
    data = data || {};

    if (data.isVerifiedTeacher) {
      dispatch(setVerified());
    }

    // We are on an overview page if currentLevelId is undefined.
    const onOverviewPage = !state.currentLevelId;
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
      dispatch(setScriptProgress(data.progress));

      // Note that we set the full progress object above in redux but also set
      // a map containing just level results. This is the legacy code path and
      // the goal is to eventually update all code paths to use scriptProgress
      // instead of levelResults.
      const levelResults = _.mapValues(data.progress, getLevelResult);
      dispatch(mergeResults(levelResults));

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
  scriptStudentDescription,
  betaTitle,
  courseId,
  isFullProgress,
  isLessonExtras,
  currentPageNumber
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
  scriptStudentDescription,
  betaTitle,
  courseId,
  isFullProgress,
  isLessonExtras,
  currentPageNumber
});

/**
 * Returns action that sets (overwrites) scriptProgress in the redux store.
 *
 * @param {scriptProgressType} scriptProgress
 * @returns action
 */
export const setScriptProgress = scriptProgress => ({
  type: SET_SCRIPT_PROGRESS,
  scriptProgress: scriptProgress
});

export const clearResults = () => ({
  type: CLEAR_RESULTS
});

export const useDbProgress = () => ({
  type: USE_DB_PROGRESS
});

export const mergeResults = levelResults => ({
  type: MERGE_RESULTS,
  levelResults: levelResults
});

export const overwriteResults = levelResults => ({
  type: OVERWRITE_RESULTS,
  levelResults: levelResults
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

export const queryUserProgress = userId => (dispatch, getState) => {
  const state = getState().progress;
  return userProgressFromServer(state, dispatch, userId);
};

// Selectors

// Do we have one or more lockable stages
export const hasLockableStages = state =>
  state.stages.some(stage => stage.lockable);

export const hasGroups = state => Object.keys(groupedLessons(state)).length > 1;

/**
 * Extract the relevant portions of a particular lesson/stage from the store.
 * Note, that this does not include levels
 * @param {object} state - The progress state in our redux store
 * @param {number} stageIndex - The index into our stages we care about
 * @returns {Lesson}
 */
const lessonFromStageAtIndex = (state, stageIndex) => ({
  ...lessonFromStage(state.stages[stageIndex]),
  isFocusArea: state.focusAreaStageIds.includes(state.stages[stageIndex].id)
});
const lessonFromStage = stage =>
  _.pick(stage, [
    'name',
    'id',
    'lockable',
    'stageNumber',
    'lesson_plan_html_url',
    'student_lesson_plan_html_url',
    'description_student',
    'description_teacher'
  ]);
export const lessons = state =>
  state.stages.map((_, index) => lessonFromStageAtIndex(state, index));

/**
 * Extract lesson from our peerReviewLessonInfo if we have one. We want this to end up
 * having the same fields as our non-peer review stages.
 */
const peerReviewLesson = state => ({
  ...lessonFromStage(state.peerReviewLessonInfo),
  // add some fields that are missing for this stage but required for lessonType
  id: PEER_REVIEW_ID,
  lockable: false,
  isFocusArea: false
});

/**
 * Extract levels from our peerReviewLessonInfo, making sure the levels have the same
 * set of fields as our non-peer review levels.
 */
const peerReviewLevels = state =>
  state.peerReviewLessonInfo.levels.map((level, index) => ({
    // These aren't true levels (i.e. we won't have an entry in levelResults),
    // so always use a specific id that won't collide with real levels
    ...level,
    id: PEER_REVIEW_ID.toString(),
    isLocked: level.locked,
    status: level.status || LevelStatus.not_tried,
    levelNumber: index + 1
  }));

/**
 * The level object passed down to use via the server (and stored in stage.stages.levels)
 * contains more data than we need. This (a) filters to the parts our views care
 * about and (b) determines current status based on the current state of
 * state.levelResults
 */
const levelWithProgress = (
  {levelResults, scriptProgress, levelPairing = {}, currentLevelId},
  level,
  isLockable
) => {
  const normalizedLevel = processedLevel(level);
  if (level.ids) {
    // make sure we're using the id with best progress
    normalizedLevel.id = bestResultLevelId(level.ids, levelResults);
  }

  // default values
  let status = LevelStatus.not_tried;
  let locked = isLockable;

  let levelProgress = scriptProgress[normalizedLevel.id];
  if (levelProgress?.pages) {
    levelProgress = levelProgress.pages[normalizedLevel.pageNumber - 1];
  }
  if (levelProgress) {
    // if we have levelProgress, overwrite default values
    status = levelProgress.status;
    locked = levelProgress.locked;
  } else if (level.kind !== LevelKind.assessment) {
    // if we don't have levelProgress, get the status from `levelResults`.
    // however, `levelResults` doesn't track per-page results for multi-page
    // assessments, so for assessments we leave default values.
    //
    // note: if we're not using levelProgress, `isLocked` will always be false.
    status = activityCssClass(levelResults[normalizedLevel.id]);
  }
  const isCurrent =
    normalizedLevel.id === currentLevelId ||
    !!level.ids?.includes[currentLevelId];

  return {
    ...normalizedLevel,
    status: status,
    isCurrentLevel: isCurrent,
    paired: levelPairing[level.activeId],
    isLocked: locked
  };
};

/**
 * Get level data for all lessons/stages
 */
export const levelsByLesson = ({
  stages,
  levelResults,
  scriptProgress,
  levelPairing,
  currentLevelId
}) =>
  stages.map(stage =>
    stage.levels.map(level => {
      let statusLevel = levelWithProgress(
        {levelResults, scriptProgress, levelPairing, currentLevelId},
        level,
        stage.lockable
      );
      if (statusLevel.sublevels) {
        statusLevel.sublevels = level.sublevels.map(sublevel =>
          levelWithProgress(
            {levelResults, scriptProgress, levelPairing, currentLevelId},
            sublevel,
            stage.lockable
          )
        );
      }
      return statusLevel;
    })
  );

/**
 * Get data for a particular lesson/stage
 */
export const levelsForLessonId = (state, lessonId) => {
  const lesson = state.stages.find(stage => stage.id === lessonId);
  return lesson.levels.map(level =>
    levelWithProgress(state, level, lesson.lockable)
  );
};

export const lessonExtrasUrl = (state, stageId) =>
  state.stageExtrasEnabled
    ? state.stages.find(stage => stage.id === stageId).lesson_extras_level_url
    : '';

export const isPerfect = (state, levelId) =>
  !!state.levelResults &&
  state.levelResults[levelId] >= TestResults.MINIMUM_OPTIMAL_RESULT;

/**
 * Groups lessons according to LessonGroup.
 * @returns {Object[]}
 * {string} Object.name
 * {string[]} Object.lessonNames
 * {Object[]} Object.stageLevels
 */
export const groupedLessons = (state, includeBonusLevels = false) => {
  let byGroup = {};

  const allLevels = levelsByLesson(state);

  state.lessonGroups.forEach(lessonGroup => {
    byGroup[lessonGroup.display_name] = {
      lessonGroup: {
        id: lessonGroup.id,
        userFacing: lessonGroup.user_facing,
        displayName: lessonGroup.display_name,
        description: lessonGroup.description,
        bigQuestions: lessonGroup.big_questions
      },
      lessons: [],
      levelsByLesson: []
    };
  });

  state.stages.forEach((lesson, index) => {
    const group = lesson.lesson_group_display_name;
    const lessonAtIndex = lessonFromStageAtIndex(state, index);
    let lessonLevels = allLevels[index];
    if (!includeBonusLevels) {
      lessonLevels = lessonLevels.filter(level => !level.bonus);
    }

    if (byGroup[group]) {
      byGroup[group].lessons.push(lessonAtIndex);
      byGroup[group].levelsByLesson.push(lessonLevels);
    }
  });

  // Peer reviews get their own group, but these levels/lesson are stored
  // separately from our other levels/lessons in redux (since they're slightly
  // different)
  if (state.peerReviewLessonInfo) {
    byGroup[state.peerReviewLessonInfo.lesson_group_display_name] = {
      group: state.peerReviewLessonInfo.lesson_group_display_name,
      lessonGroup: {
        id: null, //Peer reviews do not have descriptions or big questions so they won't need an id to track clicks
        displayName: state.peerReviewLessonInfo.lesson_group_display_name,
        description: null,
        bigQuestions: null
      },
      lessons: [peerReviewLesson(state)],
      levelsByLesson: [peerReviewLevels(state)]
    };
  }

  // We want to return an array of categories
  return _.values(byGroup);
};

/**
 * Given a set of levels, groups them in sets of progressions, where each
 * progression is a set of adjacent levels sharing the same progression name
 * Any given level's progression name is determined by first looking to see if
 * the server provided us one as level.progression, otherwise we fall back to
 * just level.name
 * @param {Level[]} levels
 * @returns {object[]} An array of progressions, where each consists of a name,
 *   the position of the progression in the input array, and the set of levels
 *   in the progression
 */
export const progressionsFromLevels = levels => {
  const progressions = [];
  if (levels.length === 0) {
    return progressions;
  }
  let currentProgression = {
    start: 0,
    name: levels[0].progression || levels[0].name,
    displayName: levels[0].progressionDisplayName || levels[0].name,
    levels: [levels[0]]
  };
  levels.slice(1).forEach((level, index) => {
    const progressionName = level.progression || level.name;
    if (progressionName === currentProgression.name) {
      currentProgression.levels.push(level);
    } else {
      progressions.push(currentProgression);
      currentProgression = {
        // + 1 because we sliced off the first element
        start: index + 1,
        name: level.progression || level.name,
        displayName: level.progressionDisplayName || level.name,
        levels: [level]
      };
    }
  });
  progressions.push(currentProgression);
  return progressions;
};

// export private function(s) to expose to unit testing
export const __testonly__ = IN_UNIT_TEST
  ? {
      bestResultLevelId,
      peerReviewLesson,
      peerReviewLevels,
      PEER_REVIEW_ID,
      userProgressFromServer
    }
  : {};
