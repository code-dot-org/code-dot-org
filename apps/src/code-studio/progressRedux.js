/**
 * Reducer and actions for progress
 */
import $ from 'jquery';
import _ from 'lodash';
import {mergeActivityResult, activityCssClass} from './activityUtils';
import {LevelStatus, LevelKind} from '@cdo/apps/util/sharedConstants';
import {TestResults} from '@cdo/apps/constants';
import {ViewType, SET_VIEW_TYPE} from './viewAsRedux';
import {processedLevel} from '@cdo/apps/templates/progress/progressHelpers';
import {setVerified} from '@cdo/apps/code-studio/verifiedTeacherRedux';
import {authorizeLockable} from './stageLockRedux';

// Action types
export const INIT_PROGRESS = 'progress/INIT_PROGRESS';
const CLEAR_PROGRESS = 'progress/CLEAR_PROGRESS';
const MERGE_PROGRESS = 'progress/MERGE_PROGRESS';
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

  // The remaining fields do change after initialization
  // a mapping of level id to result
  levelProgress: {},
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
  stageExtrasEnabled: false
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
      betaTitle: action.betaTitle,
      courseId: action.courseId,
      currentStageId,
      hasFullProgress: action.isFullProgress
    };
  }

  if (action.type === CLEAR_PROGRESS) {
    return {
      ...state,
      levelProgress: initialState.levelProgress
    };
  }

  if (action.type === MERGE_PROGRESS) {
    let newLevelProgress = {};
    const combinedLevels = Object.keys({
      ...state.levelProgress,
      ...action.levelProgress
    });
    combinedLevels.forEach(key => {
      newLevelProgress[key] = mergeActivityResult(
        state.levelProgress[key],
        action.levelProgress[key]
      );
    });

    return {
      ...state,
      levelProgress: newLevelProgress
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
 * Given a level that we get from the server using either /api/user_progress or
 * /dashboardapi/section_level_progress, extracts the result, appropriately
 * discerning a locked/submitted result for certain levels.
 */
export const getLevelResult = level => {
  if (level.status === LevelStatus.locked) {
    return TestResults.LOCKED_RESULT;
  }
  if (level.readonly_answers) {
    return TestResults.READONLY_SUBMISSION_RESULT;
  }
  if (level.submitted) {
    return TestResults.SUBMITTED_RESULT;
  }

  return level.result;
};

/**
 * Does some processing of our passed in stages, namely
 * - Removes 'hidden' field
 * - Adds 'stageNumber' field for non-lockable, non-PLC stages
 */
export function processedStages(stages, isPlc) {
  let numberOfNonLockableStages = 0;

  return stages.map(stage => {
    let stageNumber;
    if (!isPlc && !stage.lockable) {
      numberOfNonLockableStages++;
      stageNumber = numberOfNonLockableStages;
    }
    return {
      ..._.omit(stage, 'hidden'),
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
    dispatch({type: CLEAR_PROGRESS});
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
    if (data.levels) {
      const levelProgress = _.mapValues(data.levels, getLevelResult);
      dispatch(mergeProgress(levelProgress));

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
  isFullProgress
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
  isFullProgress
});

export const mergeProgress = levelProgress => ({
  type: MERGE_PROGRESS,
  levelProgress
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
    // These aren't true levels (i.e. we won't have an entry in levelProgress),
    // so always use a specific id that won't collide with real levels
    id: PEER_REVIEW_ID,
    status: level.locked ? LevelStatus.locked : level.status,
    url: level.url,
    name: level.name,
    icon: level.locked ? level.icon : undefined,
    levelNumber: index + 1
  }));

/**
 * Determine whether the passed in level is our current level (i.e. in the dots
 * in our header
 * @returns {boolean}
 */
const isCurrentLevel = (currentLevelId, level) => {
  return (
    !!currentLevelId &&
    ((level.ids &&
      level.ids.map(id => id.toString()).indexOf(currentLevelId) !== -1) ||
      level.uid === currentLevelId)
  );
};

/**
 * The level object passed down to use via the server (and stored in stage.stages.levels)
 * contains more data than we need. This (a) filters to the parts our views care
 * about and (b) determines current status based on the current state of
 * state.levelProgress
 */
const levelWithStatus = (
  {levelProgress, levelPairing = {}, currentLevelId, isSublevel = false},
  level
) => {
  if (level.kind !== LevelKind.unplugged && !isSublevel) {
    if (!level.title || typeof level.title !== 'number') {
      throw new Error(
        'Expect all non-unplugged, non-bubble choice sublevel, levels to have a numerical title'
      );
    }
  }
  return {
    ...processedLevel(level),
    status: statusForLevel(level, levelProgress),
    isCurrentLevel: isCurrentLevel(currentLevelId, level),
    paired: levelPairing[level.activeId],
    readonlyAnswers: level.readonly_answers
  };
};

/**
 * Get level data for all lessons/stages
 */
export const levelsByLesson = ({
  stages,
  levelProgress,
  levelPairing,
  currentLevelId
}) =>
  stages.map(stage =>
    stage.levels.map(level => {
      let statusLevel = levelWithStatus(
        {levelProgress, levelPairing, currentLevelId},
        level
      );
      if (statusLevel.sublevels) {
        statusLevel.sublevels = level.sublevels.map(sublevel =>
          levelWithStatus(
            {levelProgress, levelPairing, currentLevelId, isSublevel: true},
            sublevel
          )
        );
      }
      return statusLevel;
    })
  );

/**
 * Get data for a particular lesson/stage
 */
export const levelsForLessonId = (state, lessonId) =>
  state.stages
    .find(stage => stage.id === lessonId)
    .levels.map(level => levelWithStatus(state, level));

export const lessonExtrasUrl = (state, stageId) =>
  state.stageExtrasEnabled
    ? state.stages.find(stage => stage.id === stageId).lesson_extras_level_url
    : '';

export const isPerfect = (state, levelId) =>
  !!state.levelProgress &&
  state.levelProgress[levelId] >= TestResults.MINIMUM_OPTIMAL_RESULT;

export const getPercentPerfect = levels => {
  const puzzleLevels = levels.filter(level => !level.isConceptLevel);
  if (puzzleLevels.length === 0) {
    return 0;
  }

  const perfected = puzzleLevels.reduce(
    (accumulator, level) =>
      accumulator + (level.status === LevelStatus.perfect),
    0
  );
  return perfected / puzzleLevels.length;
};

/**
 * Given a level and levelProgress (both from our redux store state), determine
 * the status for that level.
 * @param {object} level - Level object from state.stages.levels
 * @param {object<number, TestResult>} levelProgress - Mapping from levelId to
 *   TestResult
 */
export function statusForLevel(level, levelProgress) {
  // Peer Reviews use a level object to track their state, but have some subtle
  // differences from regular levels (such as a separate id namespace). Unlike
  // levels, Peer Reviews store status on the level object (for the time being)
  if (level.kind === LevelKind.peer_review) {
    if (level.locked) {
      return LevelStatus.locked;
    }
    return level.status;
  }

  // LevelGroup assessments (multi-page assessments)
  // will have a uid for each page (and a test-result
  // for each uid). When locked, they will end up not having a per-uid
  // test result, but will have a LOCKED_RESULT for the LevelGroup (which
  // is tracked by ids)
  // BubbleChoice sublevels will have a level_id
  // Worth noting that in the majority of cases, ids will be a single
  // id here
  const id =
    level.uid || level.level_id || bestResultLevelId(level.ids, levelProgress);
  let status = activityCssClass(levelProgress[id]);
  if (
    level.uid &&
    level.ids.every(id => levelProgress[id] === TestResults.LOCKED_RESULT)
  ) {
    status = LevelStatus.locked;
  }

  // If complete a level that is marked as assessment
  // then mark as completed assessment
  if (
    level.kind === LevelKind.assessment &&
    [
      LevelStatus.free_play_complete,
      LevelStatus.perfect,
      LevelStatus.passed
    ].includes(status)
  ) {
    return LevelStatus.completed_assessment;
  }
  return status;
}

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
        displayName: lessonGroup.display_name,
        description: lessonGroup.description,
        bigQuestions: lessonGroup.big_questions
      },
      lessons: [],
      levels: []
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
      byGroup[group].levels.push(lessonLevels);
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
      levels: [peerReviewLevels(state)]
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
