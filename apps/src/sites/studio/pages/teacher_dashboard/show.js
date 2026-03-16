import $ from 'jquery';
import React from 'react';
import {Provider} from 'react-redux';

import announcementReducer from '@cdo/apps/code-studio/announcementsRedux';
import hiddenLesson from '@cdo/apps/code-studio/hiddenLessonRedux';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import progressRedux from '@cdo/apps/code-studio/progressRedux';
import verifiedInstructor from '@cdo/apps/code-studio/verifiedInstructorRedux';
import viewAs from '@cdo/apps/code-studio/viewAsRedux';
import {FlashHandler} from '@cdo/apps/flashes/FlashHandler';
import {getStore, registerReducers} from '@cdo/apps/redux';
import locales, {setLocaleCode} from '@cdo/apps/redux/localesRedux';
import unitSelection from '@cdo/apps/redux/unitSelectionRedux';
import currentUser, {
  setShowAITALessonSummary,
  setHasCompletedPersonalizationQuiz,
  setShowAITAPodcasts,
} from '@cdo/apps/templates/currentUserRedux';
import manageStudents from '@cdo/apps/templates/manageStudents/manageStudentsRedux';
import sectionAssessments from '@cdo/apps/templates/sectionAssessments/sectionAssessmentsRedux';
import sectionProgress from '@cdo/apps/templates/sectionProgressV2/sectionProgressRedux';
import stats from '@cdo/apps/templates/teacherDashboard/statsRedux';
import teacherSections, {
  setAuthProviders,
  selectSection,
  setSections,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {setSelectedSectionData} from '@cdo/apps/templates/teacherNavigation/selectedSectionLoader';
import TeacherNavigationRouter from '@cdo/apps/templates/teacherNavigation/TeacherNavigationRouter';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

// 6 seconds
const FLASH_DURATION = 6 * 1000;

const script = document.querySelector('script[data-dashboard]');
const scriptData = JSON.parse(script.dataset.dashboard);
const {
  section,
  sections,
  localeCode,
  showAITALessonSummary,
  showAITAPodcasts,
  hasCompletedPersonalizationQuiz,
  sectionOrder,
  providers,
  flash,
} = scriptData;

$(document).ready(function () {
  registerReducers({
    teacherSections,
    manageStudents,
    sectionProgress,
    unitSelection,
    stats,
    sectionAssessments,
    currentUser,
    locales,
    viewAs,
    hiddenLesson,
    verifiedInstructor,
    announcementReducer,
    progressRedux,
    isRtl,
  });

  const store = getStore();
  if (showAITALessonSummary) {
    store.dispatch(setShowAITALessonSummary(true));
    store.dispatch(setShowAITAPodcasts(showAITAPodcasts));
    store.dispatch(
      setHasCompletedPersonalizationQuiz(hasCompletedPersonalizationQuiz)
    );
  }
  store.dispatch(setSections(sections, false, sectionOrder));
  store.dispatch(setLocaleCode(localeCode));
  store.dispatch(setAuthProviders(providers));

  if (sections.length > 0) {
    const selectedSectionFromList = window.location.pathname.includes(
      '/teacher_dashboard/home'
    )
      ? sections[0]
      : sections.find(s => s.id === section.id);
    const selectedSection = {...selectedSectionFromList, ...section};

    store.dispatch(selectSection(selectedSection.id));

    setSelectedSectionData(selectedSection);
  }

  createReactRoot(
    <Provider store={store}>
      <TeacherNavigationRouter studioUrlPrefix={scriptData.studioUrlPrefix} />
      <FlashHandler flash={flash} autoHideDuration={FLASH_DURATION} />
    </Provider>,
    document.getElementById('teacher-dashboard')
  );
});
