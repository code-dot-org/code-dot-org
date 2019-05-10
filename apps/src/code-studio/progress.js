import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import _ from 'lodash';
import queryString from 'query-string';
import clientState from './clientState';
import StageProgress from './components/progress/StageProgress.jsx';
import {convertAssignmentVersionShapeFromServer} from '@cdo/apps/templates/teacherDashboard/shapes';
import ScriptOverview from './components/progress/ScriptOverview.jsx';
import MiniView from './components/progress/MiniView.jsx';
import DisabledBubblesModal from './DisabledBubblesModal';
import DisabledBubblesAlert from './DisabledBubblesAlert';
import {getStore} from './redux';
import {authorizeLockable} from './stageLockRedux';
import {setViewType, ViewType} from './viewAsRedux';
import {getHiddenStages, initializeHiddenScripts} from './hiddenStageRedux';
import {TestResults} from '@cdo/apps/constants';
import {
  initProgress,
  mergeProgress,
  mergePeerReviewProgress,
  updateFocusArea,
  showTeacherInfo,
  disablePostMilestone,
  setIsHocScript,
  setIsAge13Required,
  setStudentDefaultsSummaryView,
  setIsSummaryView,
  setCurrentStageId,
  setScriptCompleted,
  setStageExtrasEnabled,
  getLevelResult
} from './progressRedux';
import {setVerified} from '@cdo/apps/code-studio/verifiedTeacherRedux';
import {renderTeacherPanel} from './teacherPanelHelpers';
import experiments from '../util/experiments';

var progress = module.exports;

function showDisabledBubblesModal() {
  const div = $('<div>');
  $(document.body).append(div);

  ReactDOM.render(<DisabledBubblesModal />, div[0]);
}

/**
 * If milestone posts are disabled, show an alert about progress not being tracked.
 */
progress.showDisabledBubblesAlert = function() {
  const store = getStore();
  const {postMilestoneDisabled} = store.getState().progress;
  const showAlert =
    postMilestoneDisabled || experiments.isEnabled('postMilestoneDisabledUI');
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

  ReactDOM.render(<DisabledBubblesAlert />, div[0]);
};

/**
 * @param {object} scriptData (Note - This is only a subset of the information
 *   we have in renderCourseProgress)
 * @param {object} stageData
 * @param {object} progressData
 * @param {string} currentLevelid
 * @param {boolean} saveAnswersBeforeNavigation
 * @param {boolean} signedIn True/false if we know the sign in state of the
 *   user, null otherwise
 * @param {boolean} stageExtrasEnabled Whether this user is in a section with
 *   stageExtras enabled for this script
 */
progress.renderStageProgress = function(
  scriptData,
  stageData,
  progressData,
  currentLevelId,
  saveAnswersBeforeNavigation,
  signedIn,
  stageExtrasEnabled
) {
  const store = getStore();

  const {name, disablePostMilestone, isHocScript, age_13_required} = scriptData;

  // Depend on the fact that signed in users have a bunch of progress related
  // keys that signed out users do not
  initializeStoreWithProgress(
    store,
    {
      name,
      stages: [stageData],
      disablePostMilestone,
      age_13_required,
      id: stageData.script_id
    },
    currentLevelId,
    false,
    saveAnswersBeforeNavigation
  );

  store.dispatch(
    mergeProgress(
      _.mapValues(progressData.levels, level =>
        level.submitted ? TestResults.SUBMITTED_RESULT : level.result
      )
    )
  );

  store.dispatch(setIsHocScript(isHocScript));
  if (signedIn) {
    progress.showDisabledBubblesAlert();
  }
  if (stageExtrasEnabled) {
    store.dispatch(setStageExtrasEnabled(true));
  }
  if (progressData.isVerifiedTeacher) {
    store.dispatch(setVerified());
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
 * @param {boolean} scriptData.age_13_required
 * Render our progress on the course overview page.
 */
progress.renderCourseProgress = function(scriptData) {
  const store = getStore();
  initializeStoreWithProgress(store, scriptData, null, true);

  if (scriptData.student_detail_progress_view) {
    store.dispatch(setStudentDefaultsSummaryView(false));
  }
  initViewAs(store, scriptData);
  queryUserProgress(store, scriptData, null);

  const teacherResources = (scriptData.teacher_resources || []).map(
    ([type, link]) => ({type, link})
  );

  store.dispatch(initializeHiddenScripts(scriptData.section_hidden_unit_info));

  const mountPoint = document.createElement('div');
  $('.user-stats-block').prepend(mountPoint);
  ReactDOM.render(
    <Provider store={store}>
      <ScriptOverview
        onOverviewPage={true}
        excludeCsfColumnInLegend={scriptData.excludeCsfColumnInLegend}
        teacherResources={teacherResources}
        showCourseUnitVersionWarning={
          scriptData.show_course_unit_version_warning
        }
        showScriptVersionWarning={scriptData.show_script_version_warning}
        showRedirectWarning={scriptData.show_redirect_warning}
        redirectScriptUrl={scriptData.redirect_script_url}
        versions={convertAssignmentVersionShapeFromServer(scriptData.versions)}
        courseName={scriptData.course_name}
        locale={scriptData.locale}
        showAssignButton={scriptData.show_assign_button}
      />
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
progress.renderMiniView = function(
  element,
  scriptName,
  currentLevelId,
  linesOfCodeText,
  student_detail_progress_view
) {
  const store = getStore();
  if (student_detail_progress_view) {
    store.dispatch(setStudentDefaultsSummaryView(false));
  }

  ReactDOM.render(
    <Provider store={store}>
      <MiniView linesOfCodeText={linesOfCodeText} />
    </Provider>,
    element
  );

  $.getJSON(`/api/script_structure/${scriptName}`, scriptData => {
    initializeStoreWithProgress(store, scriptData, currentLevelId, true);
    queryUserProgress(store, scriptData, currentLevelId);
  });
};

function initViewAs(store, scriptData) {
  // Set our initial view type from current user's user_type or our query string.
  let initialViewAs = ViewType.Student;
  if (scriptData.user_type === 'teacher') {
    const query = queryString.parse(location.search);
    initialViewAs = query.viewAs || ViewType.Teacher;
  }
  store.dispatch(setViewType(initialViewAs));
}

/**
 * Query the server for user_progress data for this script, and update the store
 * as appropriate
 */
function queryUserProgress(store, scriptData, currentLevelId) {
  const onOverviewPage = !currentLevelId;

  $.ajax('/api/user_progress/' + scriptData.name, {
    data: {
      user_id: clientState.queryParams('user_id')
    }
  }).done(data => {
    data = data || {};

    const postMilestoneDisabled =
      store.getState().progress.postMilestoneDisabled ||
      experiments.isEnabled('postMilestoneDisabledUI');
    // Depend on the fact that even if we have no levelProgress, our progress
    // data will have other keys
    const signedInUser = Object.keys(data).length > 0;
    if (data.isVerifiedTeacher) {
      store.dispatch(setVerified());
    }
    if (
      onOverviewPage &&
      signedInUser &&
      postMilestoneDisabled &&
      !scriptData.isHocScript
    ) {
      showDisabledBubblesModal();
    }

    // Show lesson plan links and other teacher info if teacher and on unit
    // overview page
    if (
      (data.isTeacher || data.teacherViewingStudent) &&
      !data.professionalLearningCourse &&
      onOverviewPage
    ) {
      // Default to progress summary view if teacher is viewing their student's progress.
      if (data.teacherViewingStudent) {
        store.dispatch(setIsSummaryView(true));
      }

      store.dispatch(showTeacherInfo());

      renderTeacherPanel(store, scriptData.id, scriptData.section);
    }

    if (data.focusAreaStageIds) {
      store.dispatch(
        updateFocusArea(data.changeFocusAreaPath, data.focusAreaStageIds)
      );
    }

    if (data.lockableAuthorized) {
      store.dispatch(authorizeLockable());
    }

    if (data.completed) {
      store.dispatch(setScriptCompleted());
    }

    // Merge progress from server (loaded via AJAX)
    if (data.levels) {
      const levelProgress = _.mapValues(data.levels, getLevelResult);
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
 * @param {boolean} scriptData.age_13_required
 * @param {string} currentLevelId
 * @param {boolean} isFullProgress - True if this contains progress for the entire
 *   script vs. a single stage.
 * @param {boolean} [saveAnswersBeforeNavigation]
 */
function initializeStoreWithProgress(
  store,
  scriptData,
  currentLevelId,
  isFullProgress,
  saveAnswersBeforeNavigation = false
) {
  store.dispatch(
    initProgress({
      currentLevelId: currentLevelId,
      professionalLearningCourse: scriptData.plc,
      saveAnswersBeforeNavigation: saveAnswersBeforeNavigation,
      stages: scriptData.stages,
      peerReviewStage: scriptData.peerReviewStage,
      scriptId: scriptData.id,
      scriptName: scriptData.name,
      scriptTitle: scriptData.title,
      scriptDescription: scriptData.description,
      betaTitle: scriptData.beta_title,
      courseId: scriptData.course_id,
      isFullProgress: isFullProgress
    })
  );

  const postMilestoneDisabled =
    scriptData.disablePostMilestone ||
    experiments.isEnabled('postMilestoneDisabledUI');
  if (postMilestoneDisabled) {
    store.dispatch(disablePostMilestone());
  }

  // Determine if we are viewing student progress.
  var isViewingStudentAnswer = !!clientState.queryParams('user_id');

  // Merge in progress saved on the client, unless we are viewing student's work.
  if (!isViewingStudentAnswer) {
    store.dispatch(
      mergeProgress(clientState.allLevelsProgress()[scriptData.name] || {})
    );
  }

  if (scriptData.hideable_stages) {
    // Note: This call is async
    store.dispatch(getHiddenStages(scriptData.name, true));
  }

  store.dispatch(setIsAge13Required(scriptData.age_13_required));

  // Progress from the server should be written down locally, unless we're a teacher
  // viewing a student's work.
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
