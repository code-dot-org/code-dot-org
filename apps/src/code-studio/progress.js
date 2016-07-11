/* globals appOptions  */
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from '@cdo/apps/redux';
import _ from 'lodash';
import clientState from './clientState';
import StageProgress from './components/progress/stage_progress.jsx';
import CourseProgress from './components/progress/course_progress.jsx';
import { SUBMITTED_RESULT, mergeActivityResult, activityCssClass } from './activityUtils';

import progressReducer, {
  initProgress,
  mergeProgress,
  updateFocusArea,
  showLessonPlans
} from './progressRedux';

var progress = module.exports;

progress.renderStageProgress = function (stageData, progressData, scriptName, currentLevelId, saveAnswersBeforeNavigation) {
  var store = createStoreWithProgress({name: scriptName, stages: [stageData]}, currentLevelId, saveAnswersBeforeNavigation);
  var mountPoint = document.querySelector('.progress_container');

  store.dispatch(mergeProgress(_.mapValues(progressData.levels,
    level => level.submitted ? SUBMITTED_RESULT : level.result)));

  // Provied a function that can be called later to merge in progress now saved on the client.
  progress.refreshStageProgress = function () {
    store.dispatch(mergeProgress(clientState.allLevelsProgress()[scriptName] || {}));
  };

  ReactDOM.render(
    <Provider store={store}>
      <StageProgress />
    </Provider>,
    mountPoint
  );
};

progress.renderCourseProgress = function (scriptData, currentLevelId) {
  var store = createStoreWithProgress(scriptData, currentLevelId);
  var mountPoint = document.createElement('div');

  $.ajax(
    '/api/user_progress/' + scriptData.name,
    { data: { user_id: clientState.queryParams('user_id') } }
  ).done(data => {
    data = data || {};

    // Show lesson plan links if teacher
    if (data.isTeacher) {
      store.dispatch(showLessonPlans());
    }

    if (data.focusAreaPositions) {
      store.dispatch(updateFocusArea({
        changeFocusAreaPath: data.changeFocusAreaPath,
        focusAreaPositions: data.focusAreaPositions
      }));
    }

    // Merge progress from server (loaded via AJAX)
    if (data.levels) {
      store.dispatch(mergeProgress(_.mapValues(data.levels,
        level => level.submitted ? SUBMITTED_RESULT : level.result)
      ));
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

/**
 * Creates a redux store with our initial progress
 * @returns {object} The created redux store
 */
function createStoreWithProgress(scriptData, currentLevelId,
    saveAnswersBeforeNavigation = false) {
  const store = createStore(progressReducer, {
    currentLevelId: currentLevelId,
    professionalLearningCourse: scriptData.plc,
    progress: {},
    focusAreaPositions: [],
    saveAnswersBeforeNavigation: saveAnswersBeforeNavigation,
    stages: scriptData.stages
  });

  // Merge in progress saved on the client.
  store.dispatch(mergeProgress(
    clientState.allLevelsProgress()[scriptData.name] || {}
  ));

  // Progress from the server should be written down locally.
  store.subscribe(() => {
    clientState.batchTrackProgress(scriptData.name, store.getState().progress);
  });

  return store;
}
