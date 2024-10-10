import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {BrowserRouter} from 'react-router-dom';

import announcementReducer from '@cdo/apps/code-studio/announcementsRedux';
import hiddenLesson from '@cdo/apps/code-studio/hiddenLessonRedux';
import progressRedux from '@cdo/apps/code-studio/progressRedux';
import verifiedInstructor from '@cdo/apps/code-studio/verifiedInstructorRedux';
import viewAs from '@cdo/apps/code-studio/viewAsRedux';
import DCDO from '@cdo/apps/dcdo';
import {getStore, registerReducers} from '@cdo/apps/redux';
import locales, {setLocaleCode} from '@cdo/apps/redux/localesRedux';
import unitSelection, {setScriptId} from '@cdo/apps/redux/unitSelectionRedux';
import currentUser, {
  setCurrentUserHasSeenStandardsReportInfo,
} from '@cdo/apps/templates/currentUserRedux';
import manageStudents, {
  setLoginType,
  setShowSharingColumn,
} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';
import sectionAssessments from '@cdo/apps/templates/sectionAssessments/sectionAssessmentsRedux';
import sectionProgress from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import sectionStandardsProgress from '@cdo/apps/templates/sectionProgress/standards/sectionStandardsProgressRedux';
import progressV2Feedback from '@cdo/apps/templates/sectionProgressV2/progressV2FeedbackRedux';
import stats from '@cdo/apps/templates/teacherDashboard/statsRedux';
import TeacherDashboard from '@cdo/apps/templates/teacherDashboard/TeacherDashboard';
import teacherSections, {
  selectSection,
  setRosterProvider,
  setRosterProviderName,
  setSections,
  setStudentsForCurrentSection,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {sectionProviderName} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import TeacherNavigationRouter from '@cdo/apps/templates/teacherNavigation/TeacherNavigationRouter';
import experiments from '@cdo/apps/util/experiments';

const script = document.querySelector('script[data-dashboard]');
const scriptData = JSON.parse(script.dataset.dashboard);
const {
  section,
  sections,
  localeCode,
  hasSeenStandardsReportInfo,
  canViewStudentAIChatMessages,
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
  });

  const store = getStore();
  store.dispatch(
    setCurrentUserHasSeenStandardsReportInfo(hasSeenStandardsReportInfo)
  );
  store.dispatch(setSections(sections));
  store.dispatch(setLocaleCode(localeCode));

  const showAITutorTab = canViewStudentAIChatMessages;

  const showV2TeacherDashboard =
    DCDO.get('teacher-local-nav-v2', false) ||
    experiments.isEnabled('teacher-local-nav-v2');

  // When removing v1TeacherDashboard after v2 launch, remove `selectedSection` from api response.
  const getV1TeacherDashboard = () => {
    // Removes the trailing part of the current location path that is not needed for the router `basename`.
    // For example, if the current location path is `/teacher_dashboard/sections/1/progress`,
    // the router `basename` should be `/teacher_dashboard/sections/1`.
    const baseUrl = window.location.pathname.replace(
      RegExp(`(/teacher_dashboard/sections/${section.id}).*`),
      '$1'
    );

    const selectedSectionFromList = sections.find(s => s.id === section.id);
    const selectedSection = {...selectedSectionFromList, ...section};

    store.dispatch(selectSection(selectedSection.id));
    store.dispatch(
      setStudentsForCurrentSection(selectedSection.id, selectedSection.students)
    );
    store.dispatch(setRosterProvider(selectedSection.login_type));
    store.dispatch(setRosterProviderName(selectedSection.login_type_name));
    store.dispatch(setLoginType(selectedSection.login_type));
    if (
      !selectedSection.sharing_disabled &&
      selectedSection.script.project_sharing
    ) {
      store.dispatch(setShowSharingColumn(true));
    }

    // Default the scriptId to the script assigned to the section
    const defaultScriptId = selectedSection.script
      ? selectedSection.script.id
      : null;
    if (defaultScriptId) {
      store.dispatch(setScriptId(defaultScriptId));
    }
    return (
      <BrowserRouter basename={baseUrl}>
        <TeacherDashboard
          studioUrlPrefix={scriptData.studioUrlPrefix}
          sectionId={selectedSection.id}
          sectionName={selectedSection.name}
          studentCount={selectedSection.students.length}
          anyStudentHasProgress={selectedSection.any_student_has_progress}
          showAITutorTab={showAITutorTab}
          sectionProviderName={sectionProviderName(
            store.getState(),
            selectedSection.id
          )}
        />
      </BrowserRouter>
    );
  };

  ReactDOM.render(
    <Provider store={store}>
      {!showV2TeacherDashboard ? (
        getV1TeacherDashboard()
      ) : (
        <TeacherNavigationRouter
          studioUrlPrefix={scriptData.studioUrlPrefix}
          showAITutorTab={showAITutorTab}
        />
      )}
    </Provider>,
    document.getElementById('teacher-dashboard')
  );
});
