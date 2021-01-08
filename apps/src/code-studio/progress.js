import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import _ from 'lodash';
import queryString from 'query-string';
import clientState from './clientState';
import {convertAssignmentVersionShapeFromServer} from '@cdo/apps/templates/teacherDashboard/shapes';
import ScriptOverview from './components/progress/ScriptOverview.jsx';
import DisabledBubblesModal from './DisabledBubblesModal';
import DisabledBubblesAlert from './DisabledBubblesAlert';
import {getStore} from './redux';
import {registerReducers} from '@cdo/apps/redux';
import {setViewType, ViewType} from './viewAsRedux';
import {getHiddenStages, initializeHiddenScripts} from './hiddenStageRedux';
import {TestResults} from '@cdo/apps/constants';
import {
  initProgress,
  mergeProgress,
  disablePostMilestone,
  setIsHocScript,
  setIsAge13Required,
  setStudentDefaultsSummaryView,
  setStageExtrasEnabled,
  queryUserProgress as reduxQueryUserProgress
} from './progressRedux';
import {setVerified} from '@cdo/apps/code-studio/verifiedTeacherRedux';
import {
  selectSection,
  setSections,
  setPageType,
  pageTypes
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import googlePlatformApi, {
  loadGooglePlatformApi
} from '@cdo/apps/templates/progress/googlePlatformApiRedux';
import {queryLockStatus, renderTeacherPanel} from './teacherPanelHelpers';

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
  if (!postMilestoneDisabled) {
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
 * @param {boolean} isLessonExtras Boolean indicating we are not on a script
 *   level and therefore are on lesson extras
 * @param {number} currentPageNumber The page we are on if this is a multi-
 *   page level
 */
progress.generateStageProgress = function(
  scriptData,
  lessonGroupData,
  stageData,
  progressData,
  currentLevelId,
  saveAnswersBeforeNavigation,
  signedIn,
  stageExtrasEnabled,
  isLessonExtras,
  currentPageNumber
) {
  const store = getStore();

  const {name, disablePostMilestone, isHocScript, age_13_required} = scriptData;

  // Depend on the fact that signed in users have a bunch of progress related
  // keys that signed out users do not
  initializeStoreWithProgress(
    store,
    {
      name,
      lessonGroups: lessonGroupData,
      lessons: [stageData],
      disablePostMilestone,
      age_13_required,
      id: stageData.script_id
    },
    currentLevelId,
    false,
    saveAnswersBeforeNavigation,
    isLessonExtras,
    currentPageNumber
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
};

/**
 * @param {object} scriptData
 * @param {string} scriptData.id
 * @param {boolean} scriptData.plc
 * @param {object[]} scriptData.stages
 * @param {string} scriptData.name
 * @param {boolean} scriptData.hideable_lessons
 * @param {boolean} scriptData.isHocScript
 * @param {boolean} scriptData.age_13_required
 * Render our progress on the course overview page.
 */
progress.renderCourseProgress = function(scriptData) {
  const store = getStore();
  initializeStoreWithProgress(store, scriptData, null, true);
  initializeStoreWithSections(store, scriptData);
  if (scriptData.user_type === 'teacher') {
    initializeGooglePlatformApi(store);
  }

  if (scriptData.student_detail_progress_view) {
    store.dispatch(setStudentDefaultsSummaryView(false));
  }
  initViewAs(store, scriptData);
  queryUserProgress(store, scriptData, null);

  const teacherResources = (scriptData.teacher_resources || []).map(
    ([type, link]) => ({type, link})
  );

  store.dispatch(initializeHiddenScripts(scriptData.section_hidden_unit_info));

  store.dispatch(setPageType(pageTypes.scriptOverview));

  const mountPoint = document.createElement('div');
  $('.user-stats-block').prepend(mountPoint);
  ReactDOM.render(
    <Provider store={store}>
      <ScriptOverview
        id={scriptData.id}
        courseId={scriptData.course_id}
        onOverviewPage={true}
        excludeCsfColumnInLegend={!scriptData.csf}
        teacherResources={teacherResources}
        showCourseUnitVersionWarning={
          scriptData.show_course_unit_version_warning
        }
        showScriptVersionWarning={scriptData.show_script_version_warning}
        showRedirectWarning={scriptData.show_redirect_warning}
        redirectScriptUrl={scriptData.redirect_script_url}
        versions={convertAssignmentVersionShapeFromServer(scriptData.versions)}
        courseName={scriptData.course_name}
        showAssignButton={scriptData.show_assign_button}
        userId={scriptData.user_id}
        assignedSectionId={scriptData.assigned_section_id}
      />
    </Provider>,
    mountPoint
  );
};

progress.retrieveProgress = function(scriptName, scriptData, currentLevelId) {
  const store = getStore();
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
  const userId = clientState.queryParams('user_id');
  store.dispatch(reduxQueryUserProgress(userId)).then(data => {
    const onOverviewPage = !currentLevelId;
    if (!onOverviewPage) {
      return;
    }

    // Depend on the fact that even if we have no levelProgress, our progress
    // data will have other keys
    const signedInUser = Object.keys(data).length > 0;
    const postMilestoneDisabled = store.getState().progress
      .postMilestoneDisabled;
    if (signedInUser && postMilestoneDisabled && !scriptData.isHocScript) {
      showDisabledBubblesModal();
    }

    if (
      (data.isTeacher || data.teacherViewingStudent) &&
      !data.professionalLearningCourse
    ) {
      const pageType = currentLevelId ? 'level' : 'script_overview';
      queryLockStatus(store, scriptData.id, pageType);
      renderTeacherPanel(
        store,
        scriptData.id,
        scriptData.section,
        scriptData.name,
        null,
        pageType,
        onOverviewPage
      );
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
 * @param {boolean} [isLessonExtras] Optional boolean indicating we are not on
 *   a script level and therefore are on lesson extras
 * @param {number} [currentPageNumber] Optional. The page we are on if this is
 *   a multi-page level
 */
function initializeStoreWithProgress(
  store,
  scriptData,
  currentLevelId,
  isFullProgress,
  saveAnswersBeforeNavigation = false,
  isLessonExtras = false,
  currentPageNumber
) {
  store.dispatch(
    initProgress({
      currentLevelId: currentLevelId,
      professionalLearningCourse: scriptData.plc,
      saveAnswersBeforeNavigation: saveAnswersBeforeNavigation,
      stages: scriptData.lessons,
      lessonGroups: scriptData.lessonGroups,
      peerReviewLessonInfo: scriptData.peerReviewLessonInfo,
      scriptId: scriptData.id,
      scriptName: scriptData.name,
      scriptTitle: scriptData.title,
      scriptDescription: scriptData.description,
      scriptStudentDescription: scriptData.studentDescription,
      betaTitle: scriptData.beta_title,
      courseId: scriptData.course_id,
      isFullProgress: isFullProgress,
      isLessonExtras: isLessonExtras,
      currentPageNumber: currentPageNumber
    })
  );

  if (scriptData.disablePostMilestone) {
    store.dispatch(disablePostMilestone());
  }

  // Determine if we are viewing student progress.
  var isViewingStudentAnswer = !!clientState.queryParams('user_id');

  if (scriptData.hideable_lessons) {
    // Note: This call is async
    store.dispatch(getHiddenStages(scriptData.name, true));
  }

  store.dispatch(setIsAge13Required(scriptData.age_13_required));

  // The rest of these actions are only relevant if the current user is the
  // owner of the code being viewed.
  if (isViewingStudentAnswer) {
    return;
  }

  // We should use client state XOR database state to track user progress
  if (!store.getState().progress.usingDbProgress) {
    store.dispatch(
      mergeProgress(clientState.allLevelsProgress()[scriptData.name] || {})
    );
  }

  let lastProgress;
  store.subscribe(() => {
    const progressState = store.getState().progress;
    const nextProgress = progressState.levelProgress;
    const usingDbProgress = progressState.usingDbProgress;

    // We should use client state XOR database state to track user progress.
    // We may not know until much later, when we load the app, that there
    // is state available from the DB.
    if (!usingDbProgress && nextProgress !== lastProgress) {
      lastProgress = nextProgress;
      clientState.batchTrackProgress(scriptData.name, nextProgress);
    }
  });
}

function initializeStoreWithSections(store, scriptData) {
  const sections = scriptData.sections;
  if (!sections) {
    return;
  }

  const currentSection = scriptData.section;
  if (!currentSection) {
    // If we don't have a selected section, simply set sections and we're done.
    store.dispatch(setSections(sections));
    return;
  }

  // If we do have a selected section, merge it with the minimal data in the
  // `sections` array before storing in redux.
  const idx = sections.findIndex(section => section.id === currentSection.id);
  if (idx >= 0) {
    sections[idx] = {
      ...sections[idx],
      ...currentSection
    };
  }
  store.dispatch(setSections(sections));
  store.dispatch(selectSection(currentSection.id.toString()));
}

function initializeGooglePlatformApi(store) {
  registerReducers({googlePlatformApi});
  store.dispatch(loadGooglePlatformApi()).catch(e => console.warn(e));
}
