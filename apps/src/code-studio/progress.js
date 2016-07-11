/* globals appOptions  */
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import _ from 'lodash';
import clientState from './clientState';
import StageProgress from './components/progress/stage_progress.jsx';
import CourseProgress from './components/progress/course_progress.jsx';

var progress = module.exports;

/**
 * See ActivityConstants.
 */
const MINIMUM_PASS_RESULT = 20;
const MINIMUM_OPTIMAL_RESULT = 30;
const SUBMITTED_RESULT = 1000;
const REVIEW_REJECTED_RESULT = 1500;
const REVIEW_ACCEPTED_RESULT = 2000;

/**
 * See ApplicationHelper#activity_css_class.
 * @param result
 * @return {string}
 */
progress.activityCssClass = function (result) {
  if (!result) {
    return 'not_tried';
  }
  if (result === SUBMITTED_RESULT) {
    return 'submitted';
  }
  if (result >= MINIMUM_OPTIMAL_RESULT) {
    return 'perfect';
  }
  if (result >= MINIMUM_PASS_RESULT) {
    return 'passed';
  }
  return 'attempted';
};

/**
 * Returns the "best" of the two results, as defined in apps/src/constants.js.
 * Note that there are negative results that count as an attempt, so we can't
 * just take the maximum.
 * @param {Number} a
 * @param {Number} b
 * @return {string} The result css class.
 */
progress.mergedActivityCssClass = function (a, b) {
  return progress.activityCssClass(clientState.mergeActivityResult(a, b));
};

progress.renderStageProgress = function (stageData, progressData, scriptName, currentLevelId, saveAnswersBeforeNavigation) {
  var store = loadProgress({name: scriptName, stages: [stageData]}, currentLevelId, saveAnswersBeforeNavigation);
  var mountPoint = document.querySelector('.progress_container');

  store.dispatch({
    type: 'MERGE_PROGRESS',
    progress: _.mapValues(progressData.levels, level => level.submitted ? SUBMITTED_RESULT : level.result)
  });

  // Provied a function that can be called later to merge in progress now saved on the client.
  progress.refreshStageProgress = function () {
    store.dispatch({
      type: 'MERGE_PROGRESS',
      progress: clientState.allLevelsProgress()[scriptName] || {}
    });
  };

  ReactDOM.render(
    <Provider store={store}>
      <StageProgress />
    </Provider>,
    mountPoint
  );
};

progress.renderCourseProgress = function (scriptData, currentLevelId) {
  var store = loadProgress(scriptData, currentLevelId);
  var mountPoint = document.createElement('div');

  $.ajax(
    '/api/user_progress/' + scriptData.name,
    { data: { user_id: clientState.queryParams('user_id') } }
  ).done(data => {
    data = data || {};

    // Show lesson plan links if teacher
    if (data.isTeacher) {
      store.dispatch({
        type: 'SHOW_LESSON_PLAN_LINKS'
      });
    }

    if (data.focusAreaPositions) {
      store.dispatch({
        type: 'UPDATE_FOCUS_AREAS',
        changeFocusAreaPath: data.changeFocusAreaPath,
        focusAreaPositions: data.focusAreaPositions
      });
    }

    // Merge progress from server (loaded via AJAX)
    if (data.levels) {
      store.dispatch({
        type: 'MERGE_PROGRESS',
        progress: _.mapValues(data.levels, level => level.submitted ? SUBMITTED_RESULT : level.result),
        peerReviewsPerformed: data.peerReviewsPerformed,
      });
    }
  });

  $('.user-stats-block').prepend(mountPoint);
  ReactDOM.render(
    <Provider store={store}>
      <CourseProgress />
    </Provider>,
    mountPoint
  );
};

// Return the level with the highest progress, or the first level if none have
// been attempted
progress.bestResultLevelId = function (levelIds, progressData) {
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
};

function loadProgress(scriptData, currentLevelId, saveAnswersBeforeNavigation = false) {

  let store = createStore((state = {}, action) => {
    if (action.type === 'MERGE_PROGRESS') {
      // TODO: _.mergeWith after upgrading to Lodash 4+
      let newProgress = {};
      Object.keys(Object.assign({}, state.progress, action.progress)).forEach(key => {
        newProgress[key] = clientState.mergeActivityResult(state.progress[key], action.progress[key]);
      });

      const stages = state.stages.map(stage => Object.assign({}, stage, {levels: stage.levels.map((level, index) => {
        const id = level.uid || progress.bestResultLevelId(level.ids, newProgress);

        if (action.peerReviewsPerformed && stage.flex_category === 'Peer Review') {
          Object.assign(level, action.peerReviewsPerformed[index]);
        }

        return Object.assign({}, level, {
          status: level.kind === 'peer_review' ? level.status : progress.activityCssClass(newProgress[id]),
          id: id,
          url: level.url
        });
      })}));

      return Object.assign({}, state, {
        progress: newProgress,
        stages: stages
      });
    } else if (action.type === 'UPDATE_FOCUS_AREAS') {
      return Object.assign({}, state, {
        changeFocusAreaPath: action.changeFocusAreaPath,
        focusAreaPositions: action.focusAreaPositions
      });
    } else if (action.type === 'SHOW_LESSON_PLAN_LINKS') {
      return Object.assign({}, state, {
        showLessonPlanLinks: true
      });
    }
    return state;
  }, {
    currentLevelId: currentLevelId,
    professionalLearningCourse: scriptData.plc,
    progress: {},
    focusAreaPositions: [],
    saveAnswersBeforeNavigation: saveAnswersBeforeNavigation,
    stages: scriptData.stages,
    peerReviewsRequired: scriptData.peerReviewsRequired,
    peerReviewsPerformed: []
  });

  // Merge in progress saved on the client.
  store.dispatch({
    type: 'MERGE_PROGRESS',
    progress: clientState.allLevelsProgress()[scriptData.name] || {}
  });

  // Progress from the server should be written down locally.
  store.subscribe(() => {
    clientState.batchTrackProgress(scriptData.name, store.getState().progress);
  });

  return store;
}
