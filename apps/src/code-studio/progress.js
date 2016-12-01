import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import _ from 'lodash';
import clientState from './clientState';
import StageProgress from './components/progress/stage_progress.jsx';
import CourseProgress from './components/progress/course_progress.jsx';
import DisabledBubblesModal from './DisabledBubblesModal';
import DisabledBubblesAlert from './DisabledBubblesAlert';
import { getStore } from './redux';
import { authorizeLockable, setViewType, ViewType } from './stageLockRedux';
import { getHiddenStages } from './hiddenStageRedux';
import {
  SUBMITTED_RESULT,
  LOCKED_RESULT,
  LevelStatus,
} from './activityUtils';
import {
  initProgress,
  mergeProgress,
  updateFocusArea,
  showTeacherInfo,
  disablePostMilestone,
  setUserSignedIn,
  setIsHocScript
} from './progressRedux';
import { renderTeacherPanel } from './teacher';
import experiments from '../util/experiments';

var progress = module.exports;

function showDisabledBubblesModal() {
  const div = $('<div>');
  $(document.body).append(div);

  ReactDOM.render(<DisabledBubblesModal/>, div[0]);
}

/**
 * If milestone posts are disabled, show an alert about progress not being tracked.
 */
progress.showDisabledBubblesAlert = function () {
  const store = getStore();
  const { isHocScript, postMilestoneDisabled } = store.getState().progress;
  const showAlert = postMilestoneDisabled || experiments.isEnabled('postMilestoneDisabledUI');
  if (!showAlert) {
    return;
  }

  const div = $('<div>').css({
    position: 'absolute',
    left: 0,
    right: 0,
    top: 45,
    zIndex: 1000
  });
  $(document.body).append(div);

  ReactDOM.render(<DisabledBubblesAlert isHocScript={isHocScript}/>, div[0]);
};

/**
 * @param {object} scriptData (Note - This is only a subset of the information
 *   we have in renderCourseProgress)
 * @param {object} stageData
 * @param {object} progressData
 * @param {string} currentLevelid
 * @param {boolean} saveAnswersBeforeNavigation
 * @param {boolean} [signedIn] True/false if we know the sign in state of the
 *   user, null otherwise
 */
progress.renderStageProgress = function (scriptData, stageData, progressData,
    currentLevelId, saveAnswersBeforeNavigation, signedIn) {
  const store = getStore();

  const { name, disablePostMilestone, isHocScript } = scriptData;

  // Depend on the fact that signed in users have a bunch of progress related
  // keys that signed out users do not
  initializeStoreWithProgress(store, {
    name,
    stages: [stageData],
    disablePostMilestone
  }, currentLevelId, saveAnswersBeforeNavigation);

  store.dispatch(mergeProgress(_.mapValues(progressData.levels,
    level => level.submitted ? SUBMITTED_RESULT : level.result)));

  // Provied a function that can be called later to merge in progress now saved on the client.
  progress.refreshStageProgress = function () {
    store.dispatch(mergeProgress(clientState.allLevelsProgress()[name] || {}));
  };

  // If the server didn't tell us about signIn state (i.e. because script is
  // cached) see if we cached locally
  if (signedIn === null) {
    signedIn = clientState.getUserSignedIn();
  }

  if (signedIn !== null) {
    store.dispatch(setUserSignedIn(signedIn));
  }
  store.dispatch(setIsHocScript(isHocScript));
  if (signedIn) {
    progress.showDisabledBubblesAlert();
  }

  ReactDOM.render(
    <Provider store={store}>
      <StageProgress />
    </Provider>,
    document.querySelector('.progress_container')
  );
};

/**
 * @param {object} scriptData
 * @param {string} scriptData.id
 * @param {boolean} scriptData.plc
 * @param {object[]} scriptData.stages
 * @param {string} scriptData.name
 * @param {boolean} scriptData.peerReviewsRequired
 * @param {boolean} scriptData.hideable_stages
 * @param {boolean} scriptData.isHocScript

 * @param {string?} currentLevelId - Set when viewing course progress from our
 *   dropdown vs. the course progress page
 */
progress.renderCourseProgress = function (scriptData, currentLevelId) {
  const store = getStore();
  initializeStoreWithProgress(store, scriptData, currentLevelId);

  const onOverviewPage = !currentLevelId;

  var mountPoint = document.createElement('div');

  if (scriptData.hideable_stages) {
    store.dispatch(getHiddenStages(scriptData.name));
  }

  $.ajax(
    '/api/user_progress/' + scriptData.name,
    {
      data: {
        user_id: clientState.queryParams('user_id')
      }
    }
  ).done(data => {
    data = data || {};

    const postMilestoneDisabled = store.getState().progress.postMilestoneDisabled ||
      experiments.isEnabled('postMilestoneDisabledUI');
    // Depend on the fact that even if we have no levelProgress, our progress
    // data will have other keys
    const signedInUser = Object.keys(data).length > 0;
    store.dispatch(setUserSignedIn(signedInUser));
    if (onOverviewPage && signedInUser && postMilestoneDisabled && !scriptData.isHocScript) {
      showDisabledBubblesModal();
    }

    // Show lesson plan links and other teacher info if teacher and on unit
    // overview page
    if (data.isTeacher && !data.professionalLearningCourse && onOverviewPage) {
      store.dispatch(showTeacherInfo());
      store.dispatch(setViewType(ViewType.Teacher));
      renderTeacherPanel(store, scriptData.id);
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
      const levelProgress = _.mapValues(data.levels, level => {
        if (level.status === LevelStatus.locked) {
          return LOCKED_RESULT;
        }
        if (level.submitted || level.readonly_answers) {
          return SUBMITTED_RESULT;
        }

        return level.result;
      });
      store.dispatch(mergeProgress(levelProgress, data.peerReviewsPerformed));
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
 * Initializes our redux store with initial progress
 * @param {object} store - Our redux store
 * @param {object} scriptData
 * @param {string} scriptData.name
 * @param {boolean} scriptData.disablePostMilestone
 * @param {boolean} [scriptData.plc]
 * @param {object[]} [scriptData.stages]
 * @param {boolean} [scriptData.peerReviewsRequired]
 * @param {string} currentLevelId
 * @param {boolean} [saveAnswersBeforeNavigation]
 */
function initializeStoreWithProgress(store, scriptData, currentLevelId,
    saveAnswersBeforeNavigation = false) {
  store.dispatch(initProgress({
    currentLevelId: currentLevelId,
    professionalLearningCourse: scriptData.plc,
    saveAnswersBeforeNavigation: saveAnswersBeforeNavigation,
    stages: scriptData.stages,
    scriptName: scriptData.name,
    peerReviewsRequired: scriptData.peerReviewsRequired,
  }));

  const postMilestoneDisabled = scriptData.disablePostMilestone ||
      experiments.isEnabled('postMilestoneDisabledUI');
  if (postMilestoneDisabled) {
    store.dispatch(disablePostMilestone());
  }

  // Merge in progress saved on the client.
  store.dispatch(mergeProgress(
    clientState.allLevelsProgress()[scriptData.name] || {}
  ));

  // Progress from the server should be written down locally, unless we're a teacher
  // viewing a student's work.
  var isViewingStudentAnswer = !!clientState.queryParams('user_id');
  if (!isViewingStudentAnswer) {
    let lastProgress;
    store.subscribe(() => {
      const nextProgress = store.getState().progress.levelProgress;
      if (nextProgress !== lastProgress) {
        lastProgress = nextProgress;
        clientState.batchTrackProgress(scriptData.name, nextProgress);
      }
    });
  }
}
