/**
 * Reducer and actions for progress
 */

import { SUBMITTED_RESULT, mergeActivityResult, activityCssClass } from './activityUtils';

// Action types
const INIT_PROGRESS = 'progress/INIT_PROGRESS';
const MERGE_PROGRESS = 'progress/MERGE_PROGRESS';
const UPDATE_FOCUS_AREAS = 'progress/UPDATE_FOCUS_AREAS';
const SHOW_LESSON_PLANS = 'progress/SHOW_LESSON_PLANS';

const initialState = {
  currentLevelId: null,
  professionalLearningCourse: null,
  // a mapping of level id to result
  progress: {},
  focusAreaPositions: [],
  saveAnswersBeforeNavigation: null,
  stages: null
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
    // TODO - make sure this is right after mehal's PR is merged in
    let newProgress = {};
    Object.keys(Object.assign({}, state.progress, action.progress)).forEach(key => {
      newProgress[key] = mergeActivityResult(state.progress[key], action.progress[key]);
    });

    return Object.assign({}, state, {
      progress: newProgress,
      stages: state.stages.map(stage => Object.assign({}, stage, {levels: stage.levels.map(level => {
        let id = level.uid || bestResultLevelId(level.ids, newProgress);

        return Object.assign({}, level, {status: activityCssClass(newProgress[id])});
      })}))
    });
  }

  if (action.type === UPDATE_FOCUS_AREAS) {
    return Object.assign({}, state, {
      changeFocusAreaPath: action.changeFocusAreaPath,
      focusAreaPositions: action.focusAreaPositions
    });
  }

  if (action.type === SHOW_LESSON_PLANS) {
    return Object.assign({}, state, {
      showLessonPlanLinks: true
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
    saveAnswersBeforeNavigation, stages}) => ({
  type: INIT_PROGRESS,
  currentLevelId,
  professionalLearningCourse,
  saveAnswersBeforeNavigation,
  stages
});

export const mergeProgress = progress => ({
  type: MERGE_PROGRESS,
  progress
});

export const updateFocusArea = (changeFocusAreaPath, focusAreaPositions) => ({
  type: UPDATE_FOCUS_AREAS,
  changeFocusAreaPath,
  focusAreaPositions
});

export const showLessonPlans = () => ({ type: SHOW_LESSON_PLANS });
