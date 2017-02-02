/**
 * Reducer and actions for progress
 */
import _ from 'lodash';
import { makeEnum } from '../utils';
import {
  LevelStatus,
  mergeActivityResult,
  activityCssClass
} from './activityUtils';
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

const initialState = {
  // These first fields never change after initialization
  currentLevelId: null,
  professionalLearningCourse: null,
  // used on multi-page assessments
  saveAnswersBeforeNavigation: null,

  // The remaining fields do change after initialization
  // a mapping of level id to result
  levelProgress: {},
  focusAreaPositions: [],
  stages: null,
  peerReviewStage: null,
  peerReviewsPerformed: [],
  showTeacherInfo: false,
  signInState: SignInState.Unknown,
  postMilestoneDisabled: false,
  isHocScript: null,
  isSummaryView: true
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
      stages: stages.map(stage => _.omit(stage, 'hidden')),
      peerReviewStage: action.peerReviewStage,
      scriptName: action.scriptName,
      currentStageId
    };
  }

  if (action.type === MERGE_PROGRESS) {
    let newLevelProgress = {};
    const combinedLevels = Object.keys({
      ...state.levelProgress,
      ...action.levelProgress
    });
    combinedLevels.forEach(key => {
      newLevelProgress[key] = mergeActivityResult(state.levelProgress[key], action.levelProgress[key]);
    });

    return {
      ...state,
      levelProgress: newLevelProgress,
      stages: state.stages.map(stage => ({
        ...stage,
        levels: stage.levels.map((level, index) => {
          const lockedStage = stage.lockable &&
            level.ids.every(id => newLevelProgress[id] === TestResults.LOCKED_RESULT);

          const id = level.uid || bestResultLevelId(level.ids, newLevelProgress);
          return {
            ...level,
            status: lockedStage ? LevelStatus.locked : activityCssClass(newLevelProgress[id])
          };
        })
      }))
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


// Action creators
export const initProgress = ({currentLevelId, professionalLearningCourse,
    saveAnswersBeforeNavigation, stages, peerReviewStage, scriptName}) => ({
  type: INIT_PROGRESS,
  currentLevelId,
  professionalLearningCourse,
  saveAnswersBeforeNavigation,
  stages,
  peerReviewStage,
  scriptName
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

export const lessonNames = state => state.stages.map(stage => stage.name);

// TODO - account for locked levels
export const levelsByLesson = state => (
  state.stages.map(stage => (
    stage.levels.map(level => ({
      status: level.status,
      url: level.url,
      name: level.name
    }))
  ))
);

/**
 * Given a set of levels, groups them in sets of progressions, where each
 * progression is a set of adjacent levels sharing the same name (where that
 * "same" name might also just be undefined)
 * @param {Level[]} levels
 * @returns {object[]} An array of progressions, where each consists of a name,
 *   the position of the progression in the input array, and the set of levels
 *   in the progression
 */
export const progressionsFromLevels = levels => {
  const progressions = [];
  let currentProgression = {
    start: 0,
    name: levels[0].name,
    levels: [levels[0]]
  };
  levels.slice(1).forEach((level, index) => {
    if (level.name === currentProgression.name) {
      currentProgression.levels.push(level);
    } else {
      progressions.push(currentProgression);
      currentProgression = {
        // + 1 because we sliced off the first element
        start: index + 1,
        name: level.name,
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
  bestResultLevelId
};
/* end-test-block */
