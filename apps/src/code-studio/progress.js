import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import _ from 'lodash';
import queryString from 'query-string';
import clientState from './clientState';
import StageProgress from './components/progress/StageProgress.jsx';
import CourseProgress from './components/progress/CourseProgress.jsx';
import MiniView from './components/progress/MiniView.jsx';
import DisabledBubblesModal from './DisabledBubblesModal';
import DisabledBubblesAlert from './DisabledBubblesAlert';
import { getStore } from './redux';
import { authorizeLockable, setViewType, ViewType } from './stageLockRedux';
import { getHiddenStages } from './hiddenStageRedux';
import { LevelStatus } from '@cdo/apps/util/sharedConstants';
import { TestResults } from '@cdo/apps/constants';
import {
  initProgress,
  mergeProgress,
  mergePeerReviewProgress,
  updateFocusArea,
  showTeacherInfo,
  disablePostMilestone,
  setUserSignedIn,
  setIsHocScript,
  setIsSummaryView,
  setCurrentStageId,
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
  }, currentLevelId, false, saveAnswersBeforeNavigation);

  store.dispatch(mergeProgress(_.mapValues(progressData.levels,
    level => level.submitted ? TestResults.SUBMITTED_RESULT : level.result)));

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
 * @param {boolean} scriptData.hideable_stages
 * @param {boolean} scriptData.isHocScript
 * Render our progress on the course overview page.
 */
progress.renderCourseProgress = function (scriptData) {
  const store = getStore();
  initializeStoreWithProgress(store, scriptData, null, true);
  queryUserProgress(store, scriptData, null);

  const mountPoint = document.createElement('div');
  $('.user-stats-block').prepend(mountPoint);
  ReactDOM.render(
    <Provider store={store}>
      <CourseProgress onOverviewPage={true}/>
    </Provider>,
    mountPoint
  );
};

/**
 * @param {HTMLElement} element - DOM element we want to render into
 * @param {string} scriptName - name of current script
 * @param {string} currentLevelId - Level that we're current on.
 * @param {string} linesOfCodeText - i18n'd string staging how many lines of code
 * @param {bool} student_detail_progress_view - Should we default to progress view
 *   user has
 */
progress.renderMiniView = function (element, scriptName, currentLevelId,
    linesOfCodeText, student_detail_progress_view) {
  const store = getStore();
  if (student_detail_progress_view) {
    store.dispatch(setIsSummaryView(false));
  }

  ReactDOM.render(
    <Provider store={store}>
      <MiniView linesOfCodeText={linesOfCodeText}/>
    </Provider>,
    element
  );

  $.getJSON(`/api/script_structure/${scriptName}`, scriptData => {
    initializeStoreWithProgress(store, scriptData, currentLevelId, true);
    queryUserProgress(store, scriptData, currentLevelId);
  });
};

/**
 * Query the server for user_progress data for this script, and update the store
 * as appropriate
 */
function queryUserProgress(store, scriptData, currentLevelId) {
  const onOverviewPage = !currentLevelId;

  if (onOverviewPage && scriptData.student_detail_progress_view) {
    // If everyone has detail progress view, set that view immediately. Otherwise
    // it might happen async when we determine you're a teacher.
    store.dispatch(setIsSummaryView(false));
  }

  // If we've cached that we're a teacher, update view type immediately rather
  // than waiting on API
  if (clientState.getUserIsTeacher()) {
    const query = queryString.parse(location.search);
    if (query.viewAs === ViewType.Student) {
      // query param viewAs takes precedence over user being a student
      store.dispatch(setViewType(ViewType.Student));
    } else {
      store.dispatch(setViewType(ViewType.Teacher));
      store.dispatch(setIsSummaryView(false));
    }
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

      // If we have viewAs=Student in query params, we dont want to change
      // student/teache or summary/detail toggles
      const viewAs = queryString.parse(location.search).viewAs || ViewType.Teacher;
      if (viewAs === ViewType.Teacher) {
        store.dispatch(setViewType(viewAs));
        store.dispatch(setIsSummaryView(false));
      }
      renderTeacherPanel(store, scriptData.id);
      clientState.cacheUserIsTeacher(true);
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
          return TestResults.LOCKED_RESULT;
        }
        if (level.submitted || level.readonly_answers) {
          return TestResults.SUBMITTED_RESULT;
        }

        return level.result;
      });
      store.dispatch(mergeProgress(levelProgress));
      if (data.peerReviewsPerformed) {
        store.dispatch(mergePeerReviewProgress(data.peerReviewsPerformed));
      }
      if (data.current_stage) {
        store.dispatch(setCurrentStageId(data.current_stage));
      }
    }
  });
}

/**
 * Initializes our redux store with initial progress
 * @param {object} store - Our redux store
 * @param {object} scriptData
 * @param {string} scriptData.name
 * @param {boolean} scriptData.disablePostMilestone
 * @param {boolean} [scriptData.plc]
 * @param {object[]} [scriptData.stages]
 * @param {string} currentLevelId
 * @param {boolean} isFullProgress - True if this contains progress for the entire
 *   script vs. a single stage.
 * @param {boolean} [saveAnswersBeforeNavigation]
 */
function initializeStoreWithProgress(store, scriptData, currentLevelId,
    isFullProgress, saveAnswersBeforeNavigation = false) {
  store.dispatch(initProgress({
    currentLevelId: currentLevelId,
    professionalLearningCourse: scriptData.plc,
    saveAnswersBeforeNavigation: saveAnswersBeforeNavigation,
    stages: scriptData.stages,
    peerReviewStage: scriptData.peerReviewStage,
    scriptName: scriptData.name,
    isFullProgress: isFullProgress
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

  if (scriptData.hideable_stages) {
    // Note: This call is async
    store.dispatch(getHiddenStages(scriptData.name, true));
  }

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
