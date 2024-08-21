import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {BrowserRouter} from 'react-router-dom';

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
  sectionProviderName,
  selectSection,
  setRosterProvider,
  setRosterProviderName,
  setSections,
  setShowLockSectionField,
  setStudentsForCurrentSection, // DCDO Flag - show/hide Lock Section field
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
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
  });

  const store = getStore();
  store.dispatch(
    setCurrentUserHasSeenStandardsReportInfo(hasSeenStandardsReportInfo)
  );
  store.dispatch(setSections(sections));
  store.dispatch(setLocaleCode(localeCode));

  // DCDO Flag - show/hide Lock Section field
  store.dispatch(setShowLockSectionField(scriptData.showLockSectionField));

  const showAITutorTab = canViewStudentAIChatMessages;

  const showV2TeacherDashboard =
    DCDO.get('teacher-local-nav-v2', false) ||
    experiments.isEnabled('teacher-local-nav-v2');

  const getV1TeacherDashboard = () => {
    const baseUrl = `/teacher_dashboard/sections/${section.id}`;

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
