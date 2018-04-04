/**
 * Reducer and actions for progress
 */
import _ from 'lodash';
import { makeEnum } from '../utils';
import { mergeActivityResult, activityCssClass } from './activityUtils';
import { LevelStatus, LevelKind } from '@cdo/apps/util/sharedConstants';
import { TestResults } from '@cdo/apps/constants';
import { ViewType, SET_VIEW_TYPE } from './viewAsRedux';

// Action types
export const INIT_PROGRESS = 'progress/INIT_PROGRESS';
const MERGE_PROGRESS = 'progress/MERGE_PROGRESS';
const MERGE_PEER_REVIEW_PROGRESS = 'progress/MERGE_PEER_REVIEW_PROGRESS';
const UPDATE_FOCUS_AREAS = 'progress/UPDATE_FOCUS_AREAS';
const SHOW_TEACHER_INFO = 'progress/SHOW_TEACHER_INFO';
const DISABLE_POST_MILESTONE = 'progress/DISABLE_POST_MILESTONE';
const SET_USER_SIGNED_IN = 'progress/SET_USER_SIGNED_IN';
const SET_IS_HOC_SCRIPT = 'progress/SET_IS_HOC_SCRIPT';
const SET_IS_AGE_13_REQUIRED = 'progress/SET_IS_AGE_13_REQUIRED';
const SET_IS_SUMMARY_VIEW = 'progress/SET_IS_SUMMARY_VIEW';
const SET_STUDENT_DEFAULTS_SUMMARY_VIEW = 'progress/SET_STUDENT_DEFAULTS_SUMMARY_VIEW';
const SET_CURRENT_STAGE_ID = 'progress/SET_CURRENT_STAGE_ID';
const SET_SCRIPT_COMPLETED = 'progress/SET_SCRIPT_COMPLETED';
const SET_STAGE_EXTRAS_ENABLED = 'progress/SET_STAGE_EXTRAS_ENABLED';

export const SignInState = makeEnum('Unknown', 'SignedIn', 'SignedOut');
const PEER_REVIEW_ID = -1;

const initialState = {
  // These first fields never change after initialization
  currentLevelId: null,
  currentStageId: null,
  professionalLearningCourse: null,
  // used on multi-page assessments
  saveAnswersBeforeNavigation: null,
  stages: null,
  scriptId: null,
  scriptName: null,
  scriptTitle: null,
  courseId: null,

  // The remaining fields do change after initialization
  // a mapping of level id to result
  levelProgress: {},
  focusAreaStageIds: [],
  peerReviewStage: null,
  peerReviewsPerformed: [],
  showTeacherInfo: false,
  signInState: SignInState.Unknown,
  postMilestoneDisabled: false,
  isHocScript: null,
  isAge13Required: false,
  // Do students see summary view by default?
  studentDefaultsSummaryView: true,
  isSummaryView: true,
  hasFullProgress: false,
  stageExtrasEnabled: false,
};

/**
 * Progress reducer
 */
export default function reducer(state = initialState, action) {
  if (action.type === INIT_PROGRESS) {
    let stages = action.stages;
    // Re-initializing with full set of stages shouldn't blow away currentStageId
    const currentStageId = state.currentStageId ||
      (stages.length === 1 ? stages[0].id : undefined);
    // extract fields we care about from action
    return {
      ...state,
      currentLevelId: action.currentLevelId,
      professionalLearningCourse: action.professionalLearningCourse,
      saveAnswersBeforeNavigation: action.saveAnswersBeforeNavigation,
      stages: processedStages(stages, action.professionalLearningCourse),
      peerReviewStage: action.peerReviewStage,
      scriptId: action.scriptId,
      scriptName: action.scriptName,
      scriptTitle: action.scriptTitle,
      courseId: action.courseId,
      currentStageId,
      hasFullProgress: action.isFullProgress
    };
  }

  if (action.type === MERGE_PROGRESS) {
    let newLevelProgress = {};
    const combinedLevels = Object.keys({
      ...state.levelProgress,
      ...action.levelProgress
    });
    combinedLevels.forEach(key => {
      newLevelProgress[key] = mergeActivityResult(state.levelProgress[key],
        action.levelProgress[key]);
    });

    return {
      ...state,
      levelProgress: newLevelProgress,
    };
  }

  if (action.type === MERGE_PEER_REVIEW_PROGRESS) {
    return {
      ...state,
      peerReviewStage: {
        ...state.peerReviewStage,
        levels: state.peerReviewStage.levels.map((level, index) => ({
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

  if (action.type === SET_USER_SIGNED_IN) {
    return {
      ...state,
      signInState: action.isSignedIn ? SignInState.SignedIn : SignInState.SignedOut
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
    const { viewType } = action;
    return {
      ...state,
      isSummaryView: viewType === ViewType.Student && state.studentDefaultsSummaryView
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
      scriptCompleted: true,
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
  attemptedIds.forEach(function (id) {
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
  if (level.submitted || level.readonly_answers) {
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

// Action creators
export const initProgress = ({currentLevelId, professionalLearningCourse,
    saveAnswersBeforeNavigation, stages, peerReviewStage, scriptId, scriptName,
    scriptTitle, courseId, isFullProgress}) => ({
  type: INIT_PROGRESS,
  currentLevelId,
  professionalLearningCourse,
  saveAnswersBeforeNavigation,
  stages,
  peerReviewStage,
  scriptId,
  scriptName,
  scriptTitle,
  courseId,
  isFullProgress,
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

export const showTeacherInfo = () => ({ type: SHOW_TEACHER_INFO });

export const disablePostMilestone = () => ({ type: DISABLE_POST_MILESTONE });
export const setUserSignedIn = isSignedIn => ({ type: SET_USER_SIGNED_IN, isSignedIn });
export const setIsHocScript = isHocScript => ({ type: SET_IS_HOC_SCRIPT, isHocScript });
export const setIsAge13Required = isAge13Required => ({ type: SET_IS_AGE_13_REQUIRED, isAge13Required });
export const setIsSummaryView = isSummaryView => ({ type: SET_IS_SUMMARY_VIEW, isSummaryView });
export const setStudentDefaultsSummaryView = studentDefaultsSummaryView => (
  { type: SET_STUDENT_DEFAULTS_SUMMARY_VIEW, studentDefaultsSummaryView });
export const setCurrentStageId = stageId => ({ type: SET_CURRENT_STAGE_ID, stageId });
export const setScriptCompleted = () => ({type: SET_SCRIPT_COMPLETED });
export const setStageExtrasEnabled = stageExtrasEnabled => (
  { type: SET_STAGE_EXTRAS_ENABLED, stageExtrasEnabled });

// Selectors

// Do we have one or more lockable stages
export const hasLockableStages = state => state.stages.some(stage => stage.lockable);

export const hasGroups = state => Object.keys(categorizedLessons(state)).length > 1;

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
const lessonFromStage = stage => _.pick(stage, [
  'name',
  'id',
  'lockable',
  'stageNumber',
  'lesson_plan_html_url',
  'description_student',
  'description_teacher',
]);
export const lessons = state => state.stages.map((_, index) => lessonFromStageAtIndex(state, index));

/**
 * Extract lesson from our peerReviewStage if we have one. We want this to end up
 * having the same fields as our non-peer review stages.
 */
const peerReviewLesson = state => ({
  ...lessonFromStage(state.peerReviewStage),
  // add some fields that are missing for this stage but required for lessonType
  id: PEER_REVIEW_ID,
  lockable: false,
  isFocusArea: false
});

/**
 * Extract levels from our peerReviewStage, making sure the levels have the same
 * set of fields as our non-peer review levels.
 */
const peerReviewLevels = state => state.peerReviewStage.levels.map((level, index) => ({
  // These aren't true levels (i.e. we won't have an entry in levelProgress),
  // so always use a specific id that won't collide with real levels
  id: PEER_REVIEW_ID,
  status: (level.locked ? LevelStatus.locked : level.status),
  url: level.url,
  name: level.name,
  icon: (level.locked ? level.icon : undefined),
  levelNumber: index + 1
}));

/**
 * Determine whether the passed in level is our current level (i.e. in the dots
 * in our header
 * @returns {boolean}
 */
const isCurrentLevel = (currentLevelId, level) => {
  return !!currentLevelId &&
    ((level.ids && level.ids.map(id => id.toString()).indexOf(currentLevelId) !== -1) ||
    level.uid === currentLevelId);
};

/**
 * The level object passed down to use via the server (and stored in stage.stages.levels)
 * contains more data than we need. This (a) filters to the parts our views care
 * about and (b) determines current status based on the current state of
 * state.levelProgress
 */
const levelWithStatus = ({levelProgress, currentLevelId}, level) => {
  if (level.kind !== LevelKind.unplugged) {
    if (!level.title || typeof(level.title) !== 'number') {
      throw new Error('Expect all non-unplugged levels to have a numerical title');
    }
  }
  return {
    status: statusForLevel(level, levelProgress),
    url: level.url,
    name: level.name,
    progression: level.progression,
    kind: level.kind,
    icon: level.icon,
    isUnplugged: level.kind === LevelKind.unplugged,
    levelNumber: level.kind === LevelKind.unplugged ? undefined : level.title,
    isCurrentLevel: isCurrentLevel(currentLevelId, level),
    isConceptLevel: level.is_concept_level,
  };
};

/**
 * Get level data for all lessons/stages
 */
export const levelsByLesson = ({stages, levelProgress, currentLevelId}) => (
  stages.map(stage => (
    stage.levels.map(level => levelWithStatus({levelProgress, currentLevelId}, level))
  ))
);

/**
 * Get level data for one lesson/stage
 */
export const levelByLesson = ({stage, levelProgress, currentLevelId}) => (
  stage.levels.map(level => levelWithStatus({levelProgress, currentLevelId}, level))
);

/**
 * Get data for a particular lesson/stage
 */
export const levelsForLessonId = (state, lessonId) => (
  state.stages.find(stage => stage.id === lessonId).levels.map(
    level => levelWithStatus(state, level)
  )
);

export const stageExtrasUrl = (state, stageId) => (
  state.stageExtrasEnabled
    ? state.stages.find(stage => stage.id === stageId).stage_extras_level_url
    : ''
);

export const isPerfect = (state, levelId) => (
  !!state.levelProgress &&
    state.levelProgress[levelId] >= TestResults.MINIMUM_OPTIMAL_RESULT
);

export const getPercentPerfect = levels => {
  const puzzleLevels = levels.filter(level => !level.isConceptLevel);
  if (puzzleLevels.length === 0) {
    return 0;
  }

  const perfected = puzzleLevels.reduce((accumulator, level) =>
    accumulator + (level.status === LevelStatus.perfect), 0);
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

  // Assessment levels will have a uid for each page (and a test-result
  // for each uid). When locked, they will end up not having a per-uid
  // test result, but will have a LOCKED_RESULT for the LevelGroup (which
  // is tracked by ids)
  // Worth noting that in the majority of cases, ids will be a single
  // id here
  const id = level.uid || bestResultLevelId(level.ids, levelProgress);
  let status = activityCssClass(levelProgress[id]);
  if (level.uid &&
      level.ids.every(id => levelProgress[id] === TestResults.LOCKED_RESULT)) {
    status = LevelStatus.locked;
  }
  return status;
}


/**
 * Groups lessons (aka stages) according to category.
 * @returns {Object[]}
 * {string} Object.name
 * {string[]} Object.lessonNames
 * {Object[]} Object.stageLevels
 */
export const categorizedLessons = state => {
  let byCategory = {};

  const allLevels = levelsByLesson(state);

  state.stages.forEach((stage, index) => {
    const category = stage.flex_category;
    const lesson = lessonFromStageAtIndex(state, index);
    const stageLevels = allLevels[index];

    byCategory[category] = byCategory[category] || {
      category,
      lessons: [],
      levels: []
    };

    byCategory[category].lessons.push(lesson);
    byCategory[category].levels.push(stageLevels);
  });

  // Peer reviews get their own category, but these levels/lessson are stored
  // separately from our other levels/lessons in redux (since they're slightly
  // different)
  if (state.peerReviewStage) {
    byCategory['Peer Review'] = {
      category: 'Peer Review',
      lessons: [peerReviewLesson(state)],
      levels: [peerReviewLevels(state)]
    };
  }

  // We want to return an array of categories
  return _.values(byCategory);
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
        levels: [level]
      };
    }
  });
  progressions.push(currentProgression);
  return progressions;
};

/* start-test-block */
// export private function(s) to expose to unit testing
export const __testonly__ = {
  bestResultLevelId,
  peerReviewLesson,
  peerReviewLevels,
  PEER_REVIEW_ID
};
/* end-test-block */
