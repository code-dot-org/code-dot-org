/**
 * Reducer and actions for progress
 */
import _ from 'lodash';
import { makeEnum } from '../utils';
import { mergeActivityResult, activityCssClass } from './activityUtils';
import { LevelStatus, LevelKind } from '@cdo/apps/util/sharedConstants';
import { TestResults } from '@cdo/apps/constants';

// Action types
export const INIT_PROGRESS = 'progress/INIT_PROGRESS';
const MERGE_PROGRESS = 'progress/MERGE_PROGRESS';
const MERGE_PEER_REVIEW_PROGRESS = 'progress/MERGE_PEER_REVIEW_PROGRESS';
const UPDATE_FOCUS_AREAS = 'progress/UPDATE_FOCUS_AREAS';
const SHOW_TEACHER_INFO = 'progress/SHOW_TEACHER_INFO';
const DISABLE_POST_MILESTONE = 'progress/DISABLE_POST_MILESTONE';
const SET_USER_SIGNED_IN = 'progress/SET_USER_SIGNED_IN';
const SET_IS_HOC_SCRIPT = 'progress/SET_IS_HOC_SCRIPT';
const SET_IS_SUMMARY_VIEW = 'progress/SET_IS_SUMMARY_VIEW';

export const SignInState = makeEnum('Unknown', 'SignedIn', 'SignedOut');
const PEER_REVIEW_ID = -1;

const initialState = {
  // These first fields never change after initialization
  currentLevelId: null,
  professionalLearningCourse: null,
  // used on multi-page assessments
  saveAnswersBeforeNavigation: null,
  stages: null,

  // The remaining fields do change after initialization
  // a mapping of level id to result
  levelProgress: {},
  focusAreaPositions: [],
  peerReviewStage: null,
  peerReviewsPerformed: [],
  showTeacherInfo: false,
  signInState: SignInState.Unknown,
  postMilestoneDisabled: false,
  isHocScript: null,
  isSummaryView: true,
  hasFullProgress: false
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
      scriptName: action.scriptName,
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
      focusAreaPositions: action.focusAreaPositions
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

  if (action.type === SET_IS_SUMMARY_VIEW) {
    return {
      ...state,
      isSummaryView: action.isSummaryView
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
    saveAnswersBeforeNavigation, stages, peerReviewStage, scriptName,
    isFullProgress}) => ({
  type: INIT_PROGRESS,
  currentLevelId,
  professionalLearningCourse,
  saveAnswersBeforeNavigation,
  stages,
  peerReviewStage,
  scriptName,
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

export const updateFocusArea = (changeFocusAreaPath, focusAreaPositions) => ({
  type: UPDATE_FOCUS_AREAS,
  changeFocusAreaPath,
  focusAreaPositions
});

export const showTeacherInfo = () => ({ type: SHOW_TEACHER_INFO });

export const disablePostMilestone = () => ({ type: DISABLE_POST_MILESTONE });
export const setUserSignedIn = isSignedIn => ({ type: SET_USER_SIGNED_IN, isSignedIn });
export const setIsHocScript = isHocScript => ({ type: SET_IS_HOC_SCRIPT, isHocScript });
export const setIsSummaryView = isSummaryView => ({ type: SET_IS_SUMMARY_VIEW, isSummaryView });

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
  isFocusArea: state.focusAreaPositions.includes(state.stages[stageIndex].position)
});
const lessonFromStage = stage => _.pick(stage, ['name', 'id', 'lockable', 'stageNumber', 'lesson_plan_html_url']);
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
 * The level object passed down to use via the server (and stored in stage.stages.levels)
 * contains more data than we need. This (a) filters to the parts our views care
 * about and (b) determines current status based on the current state of
 * state.levelProgress
 */
export const levelsByLesson = state => (
  state.stages.map(stage => (
    stage.levels.map(level => {
      if (level.kind !== LevelKind.unplugged) {
        if (!level.title || typeof(level.title) !== 'number') {
          throw new Error('Expect all non-unplugged levels to have a numerical title');
        }
      }
      return {
        status: statusForLevel(level, state.levelProgress),
        url: level.url,
        name: level.name,
        progression: level.progression,
        icon: level.icon,
        isUnplugged: level.kind === LevelKind.unplugged,
        levelNumber: level.kind === LevelKind.unplugged ? undefined : level.title
      };
    })
  ))
);

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
