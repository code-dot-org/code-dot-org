import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import {displayDifferentiationChat} from '@cdo/apps/aiDifferentiation/aiDiffUtils';
import announcementReducer from '@cdo/apps/code-studio/announcementsRedux';
import hiddenLesson from '@cdo/apps/code-studio/hiddenLessonRedux';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import progressRedux from '@cdo/apps/code-studio/progressRedux';
import verifiedInstructor from '@cdo/apps/code-studio/verifiedInstructorRedux';
import viewAs from '@cdo/apps/code-studio/viewAsRedux';
import {getStore, registerReducers} from '@cdo/apps/redux';
import locales, {setLocaleCode} from '@cdo/apps/redux/localesRedux';
import unitSelection from '@cdo/apps/redux/unitSelectionRedux';
import currentUser, {
  setCurrentUserHasSeenStandardsReportInfo,
} from '@cdo/apps/templates/currentUserRedux';
import manageStudents from '@cdo/apps/templates/manageStudents/manageStudentsRedux';
import sectionAssessments from '@cdo/apps/templates/sectionAssessments/sectionAssessmentsRedux';
import sectionProgress from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import sectionStandardsProgress from '@cdo/apps/templates/sectionProgress/standards/sectionStandardsProgressRedux';
import progressV2Feedback from '@cdo/apps/templates/sectionProgressV2/progressV2FeedbackRedux';
import TeacherHomepage from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/TeacherHomepage';
import stats from '@cdo/apps/templates/teacherDashboard/statsRedux';
import teacherSections, {
  setAuthProviders,
  selectSection,
  setSections,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {setSelectedSectionData} from '@cdo/apps/templates/teacherNavigation/selectedSectionLoader';
import TeacherNavigationRouter from '@cdo/apps/templates/teacherNavigation/TeacherNavigationRouter';

const script = document.querySelector('script[data-dashboard]');
const scriptData = JSON.parse(script.dataset.dashboard);
const {
  section,
  sections,
  localeCode,
  hasSeenStandardsReportInfo,
  canViewStudentAIChatMessages,
  sectionOrder,
  providers,
} = scriptData;

$(document).ready(function () {
  registerReducers({
    teacherSections,
    manageStudents,
    sectionProgress,
    progressV2Feedback,
    unitSelection,
    stats,
    sectionAssessments,
    currentUser,
    sectionStandardsProgress,
    locales,
    viewAs,
    hiddenLesson,
    verifiedInstructor,
    announcementReducer,
    progressRedux,
    isRtl,
  });

  const store = getStore();
  store.dispatch(
    setCurrentUserHasSeenStandardsReportInfo(hasSeenStandardsReportInfo)
  );
  store.dispatch(setSections(sections, false, sectionOrder));
  store.dispatch(setLocaleCode(localeCode));
  store.dispatch(setAuthProviders(providers));

  const showAITutorTab = canViewStudentAIChatMessages;

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

  ReactDOM.render(
    <Provider store={store}>
      {sections.length === 0 ? (
        // If a teacher has no sections, we will send them directly to the homepage to bypass
        // all of the section loading logic in the TeacherNavigationRouter.
        <TeacherHomepage />
      ) : (
        <TeacherNavigationRouter
          studioUrlPrefix={scriptData.studioUrlPrefix}
          showAITutorTab={showAITutorTab}
        />
      )}
    </Provider>,
    document.getElementById('teacher-dashboard')
  );
  displayDifferentiationChat();
});
