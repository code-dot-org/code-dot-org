import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {BrowserRouter} from 'react-router-dom';

import DCDO from '@cdo/apps/dcdo';
import {getStore, registerReducers} from '@cdo/apps/redux';
import locales, {setLocaleCode} from '@cdo/apps/redux/localesRedux';
import unitSelection from '@cdo/apps/redux/unitSelectionRedux';
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
  setSections,
  selectSection,
  setRosterProvider,
  setRosterProviderName,
  setShowLockSectionField, // DCDO Flag - show/hide Lock Section field
  setStudentsForCurrentSection,
  sectionProviderName,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import TeacherNavigationRouter from '@cdo/apps/templates/teacherNavigation/TeacherNavigationRouter';
import experiments from '@cdo/apps/util/experiments';

import {setScriptId} from '../../../../redux/unitSelectionRedux';

const script = document.querySelector('script[data-dashboard]');
const scriptData = JSON.parse(script.dataset.dashboard);
const {
  anyStudentHasProgress,
  section,
  sections,
  localeCode,
  hasSeenStandardsReportInfo,
  canViewStudentAIChatMessages,
} = scriptData;
const baseUrl = `/teacher_dashboard/sections/${section.id}`;

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

  const selectedSectionFromList = sections.find(s => s.id === section.id);
  const selectedSection = {...selectedSectionFromList, ...section};

  const store = getStore();
  store.dispatch(
    setCurrentUserHasSeenStandardsReportInfo(hasSeenStandardsReportInfo)
  );
  store.dispatch(setSections(sections));
  store.dispatch(selectSection(selectedSection.id));
  store.dispatch(
    setStudentsForCurrentSection(selectedSection.id, selectedSection.students)
  );
  store.dispatch(setRosterProvider(selectedSection.login_type));
  store.dispatch(setRosterProviderName(selectedSection.login_type_name));
  store.dispatch(setLoginType(selectedSection.login_type));
  store.dispatch(setLocaleCode(localeCode));

  // DCDO Flag - show/hide Lock Section field
  store.dispatch(setShowLockSectionField(scriptData.showLockSectionField));

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

  const showAITutorTab = canViewStudentAIChatMessages;

  const showV2TeacherDashboard =
    DCDO.get('teacher-local-nav-v2', false) ||
    experiments.isEnabled('teacher-local-nav-v2');

  const getV1TeacherDashboard = () => (
    <BrowserRouter basename={baseUrl}>
      <TeacherDashboard
        studioUrlPrefix={scriptData.studioUrlPrefix}
        sectionId={selectedSection.id}
        sectionName={selectedSection.name}
        studentCount={selectedSection.students.length}
        anyStudentHasProgress={anyStudentHasProgress}
        showAITutorTab={showAITutorTab}
        sectionProviderName={sectionProviderName(
          store.getState(),
          selectedSection.id
        )}
      />
    </BrowserRouter>
  );

  ReactDOM.render(
    <Provider store={store}>
      {!showV2TeacherDashboard ? (
        getV1TeacherDashboard()
      ) : (
        <TeacherNavigationRouter
          studioUrlPrefix={scriptData.studioUrlPrefix}
          sectionId={selectedSection.id}
          sectionName={selectedSection.name}
          studentCount={selectedSection.students.length}
          anyStudentHasProgress={anyStudentHasProgress}
          showAITutorTab={showAITutorTab}
          sectionProviderName={sectionProviderName(
            store.getState(),
            selectedSection.id
          )}
        />
      )}
    </Provider>,
    document.getElementById('teacher-dashboard')
  );
});
