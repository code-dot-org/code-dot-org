/**
 * Reducer and actions for progress
 */

import { SUBMITTED_RESULT, mergeActivityResult, activityCssClass } from './activityUtils';

// Action types
const INIT_PROGRESS = 'progress/INIT_PROGRESS';
const MERGE_PROGRESS = 'progress/MERGE_PROGRESS';
const UPDATE_FOCUS_AREAS = 'progress/UPDATE_FOCUS_AREAS';
const SHOW_TEACHER_INFO = 'progress/SHOW_TEACHER_INFO';

const initialState = {
  currentLevelId: null,
  professionalLearningCourse: null,
  // a mapping of level id to result
  levelProgress: {},
  focusAreaPositions: [],
  saveAnswersBeforeNavigation: null,
  stages: null,
  peerReviewsRequired: {},
  peerReviewsPerformed: [],
  showTeacherInfo: false
};

/**
 * Progress reducer
 */
export default function reducer(state = initialState, action) {
  if (action.type === INIT_PROGRESS) {
    // extract fields we care about from action
    return Object.assign({}, state, {
      currentLevelId: action.currentLevelId,
      professionalLearningCourse: action.professionalLearningCourse,
      saveAnswersBeforeNavigation: action.saveAnswersBeforeNavigation,
      stages: action.stages
    });
  }

  if (action.type === MERGE_PROGRESS) {
    // TODO: _.mergeWith after upgrading to Lodash 4+
    let newLevelProgress = {};
    Object.keys(Object.assign({}, state.levelProgress, action.levelProgress)).forEach(key => {
      newLevelProgress[key] = mergeActivityResult(state.levelProgress[key], action.levelProgress[key]);
    });

    return Object.assign({}, state, {
      levelProgress: newLevelProgress,
      stages: state.stages.map(stage => Object.assign({}, stage, {levels: stage.levels.map((level, index) => {
        let id = level.uid || bestResultLevelId(level.ids, newLevelProgress);

        if (action.peerReviewsPerformed && stage.flex_category === 'Peer Review') {
          Object.assign(level, action.peerReviewsPerformed[index]);
        }

        return Object.assign({}, level, level.kind !== 'peer_review' && {status: activityCssClass(newLevelProgress[id])});
      })}))
    });
  }

  if (action.type === UPDATE_FOCUS_AREAS) {
    return Object.assign({}, state, {
      changeFocusAreaPath: action.changeFocusAreaPath,
      focusAreaPositions: action.focusAreaPositions
    });
  }

  if (action.type === SHOW_TEACHER_INFO) {
    return Object.assign({}, state, {
      showTeacherInfo: true
    });
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
    saveAnswersBeforeNavigation, stages, peerReviewsRequired}) => ({
  type: INIT_PROGRESS,
  currentLevelId,
  professionalLearningCourse,
  saveAnswersBeforeNavigation,
  stages,
  peerReviewsRequired
});

export const mergeProgress = (levelProgress, peerReviewsPerformed) => ({
  type: MERGE_PROGRESS,
  levelProgress,
  peerReviewsPerformed
});

export const updateFocusArea = (changeFocusAreaPath, focusAreaPositions) => ({
  type: UPDATE_FOCUS_AREAS,
  changeFocusAreaPath,
  focusAreaPositions
});

export const showTeacherInfo = () => ({ type: SHOW_TEACHER_INFO });

/* start-test-block */
// export private function(s) to expose to unit testing
export const __testonly__ = {
  bestResultLevelId
};
/* end-test-block */
