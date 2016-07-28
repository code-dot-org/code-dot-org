/* globals appOptions  */
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import _ from 'lodash';
import clientState from './clientState';
import StageProgress from './components/progress/stage_progress.jsx';
import CourseProgress from './components/progress/course_progress.jsx';
import ScriptTeacherPanel from './components/progress/ScriptTeacherPanel';
import { SUBMITTED_RESULT, mergeActivityResult, activityCssClass } from './activityUtils';
import { getStore } from './redux';

import {
  initProgress,
  mergeProgress,
  updateFocusArea,
  showTeacherInfo,
  authorizeLockable
} from './progressRedux';

var progress = module.exports;

progress.renderStageProgress = function (stageData, progressData, scriptName,
    currentLevelId, saveAnswersBeforeNavigation) {
  const store = initializeStoreWithProgress({
    name: scriptName,
    stages: [stageData]
  }, currentLevelId, saveAnswersBeforeNavigation);

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
    document.querySelector('.progress_container')
  );
};

/**
 * @param {object} scriptData
 * @param {string?} currentLevelId - Set when viewing course progress from our
 *   dropdown vs. the course progress page
 */
progress.renderCourseProgress = function (scriptData, currentLevelId) {
  const store = initializeStoreWithProgress(scriptData, currentLevelId);
  var mountPoint = document.createElement('div');

  $.ajax(
    '/api/user_progress/' + scriptData.name,
    {
      data: {
        user_id: clientState.queryParams('user_id')
      }
    }
  ).done(data => {
    data = data || {};

    // Show lesson plan links and other teacher info if teacher and on unit
    // overview page
    if (data.isTeacher && !currentLevelId) {
      store.dispatch(showTeacherInfo());
      // TODO - do i also need to validate that they have sections?
      renderTeacherPanel(store);
    }

    if (data.focusAreaPositions) {
      store.dispatch(updateFocusArea(data.changeFocusAreaPath,
        data.focusAreaPositions));
    }

    if (data.lockableAuthorized) {
      store.dispatch(authorizeLockable());
    }

    // Merge progress from server (loaded via AJAX)
    if (data.levels) {
      store.dispatch(mergeProgress(
        _.mapValues(data.levels,
          level => level.submitted ? SUBMITTED_RESULT : level.result),
        data.peerReviewsPerformed
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

function renderTeacherPanel(store) {
  const div = document.createElement('div');
  div.setAttribute('id', 'teacher-panel-container');
  $.ajax(
    '/dashboardapi/section_progress',
    { data: { user_id: clientState.queryParams('user_id') } }
  ).done(data => {
    console.log(data);
  });

  ReactDOM.render(
    <Provider store={store}>
      <ScriptTeacherPanel/>
    </Provider>,
    div
  );
  document.body.appendChild(div);
}

/**
 * Creates a redux store with our initial progress
 * @param scriptData
 * @param currentLevelId
 * @param saveAnswersBeforeNavigation
 * @returns {object} The created redux store
 */
function initializeStoreWithProgress(scriptData, currentLevelId,
    saveAnswersBeforeNavigation = false) {
  const store = getStore();

  store.dispatch(initProgress({
    currentLevelId: currentLevelId,
    professionalLearningCourse: scriptData.plc,
    saveAnswersBeforeNavigation: saveAnswersBeforeNavigation,
    stages: scriptData.stages,
    peerReviewsRequired: scriptData.peerReviewsRequired,
  }));

  // Merge in progress saved on the client.
  store.dispatch(mergeProgress(
    clientState.allLevelsProgress()[scriptData.name] || {}
  ));

  // Progress from the server should be written down locally, unless we're a teacher
  // viewing a student's work.
  var isViewingStudentAnswer = !!clientState.queryParams('user_id');
  if (!isViewingStudentAnswer) {
    store.subscribe(() => {
      clientState.batchTrackProgress(scriptData.name, store.getState().progress.levelProgress);
    });
  }

  return store;
}
