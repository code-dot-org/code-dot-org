import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import {Provider} from 'react-redux';
import {getStore, registerReducers} from '@cdo/apps/redux';
import manageStudents, {
  setLoginType,
  setShowSharingColumn
} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';
import teacherSections, {
  setSections,
  selectSection,
  setRosterProvider,
  setValidAssignments,
  setValidGrades,
  setTextToSpeechUnitIds,
  setLessonExtrasUnitIds,
  setShowLockSectionField, // DCDO Flag - show/hide Lock Section field
  setStudentsForCurrentSection
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import stats from '@cdo/apps/templates/teacherDashboard/statsRedux';
import sectionAssessments from '@cdo/apps/templates/sectionAssessments/sectionAssessmentsRedux';
import sectionProgress from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import sectionStandardsProgress from '@cdo/apps/templates/sectionProgress/standards/sectionStandardsProgressRedux';
import unitSelection from '@cdo/apps/redux/unitSelectionRedux';
import TeacherDashboard from '@cdo/apps/templates/teacherDashboard/TeacherDashboard';
import currentUser, {
  setCurrentUserHasSeenStandardsReportInfo
} from '@cdo/apps/templates/currentUserRedux';
import {
  setValidScripts,
  setScriptId
} from '../../../../redux/unitSelectionRedux';
import locales, {setLocaleCode} from '@cdo/apps/redux/localesRedux';

const script = document.querySelector('script[data-dashboard]');
const scriptData = JSON.parse(script.dataset.dashboard);
const {
  section,
  sections,
  validGrades,
  validScripts,
  studentScriptIds,
  validCourses,
  hasSeenStandardsReportInfo,
  localeCode,
  textToSpeechUnitIds,
  lessonExtrasUnitIds
} = scriptData;
const baseUrl = `/teacher_dashboard/sections/${section.id}`;

$(document).ready(function() {
  registerReducers({
    teacherSections,
    manageStudents,
    sectionProgress,
    unitSelection,
    stats,
    sectionAssessments,
    currentUser,
    sectionStandardsProgress,
    locales
  });
  const store = getStore();
  // TODO: (madelynkasula) remove duplication in sectionData.setSection and teacherSections.setSections
  store.dispatch(
    setCurrentUserHasSeenStandardsReportInfo(hasSeenStandardsReportInfo)
  );
  store.dispatch(setSections(sections));
  store.dispatch(selectSection(section.id));
  store.dispatch(setStudentsForCurrentSection(section.id, section.students));
  store.dispatch(setRosterProvider(section.login_type));
  store.dispatch(setLoginType(section.login_type));
  store.dispatch(setValidAssignments(validCourses, validScripts));
  store.dispatch(setValidGrades(validGrades));
  store.dispatch(setLocaleCode(localeCode));
  store.dispatch(setLessonExtrasUnitIds(lessonExtrasUnitIds));
  store.dispatch(setTextToSpeechUnitIds(textToSpeechUnitIds));

  // DCDO Flag - show/hide Lock Section field
  store.dispatch(setShowLockSectionField(scriptData.showLockSectionField));

  if (!section.sharing_disabled && section.script.project_sharing) {
    store.dispatch(setShowSharingColumn(true));
  }

  store.dispatch(
    setValidScripts(validScripts, studentScriptIds, validCourses, section)
  );

  // Default the scriptId to the script assigned to the section
  const defaultScriptId = section.script ? section.script.id : null;
  store.dispatch(setScriptId(defaultScriptId));

  ReactDOM.render(
    <Provider store={store}>
      <Router basename={baseUrl}>
        <Route
          path="/"
          component={props => (
            <TeacherDashboard
              {...props}
              studioUrlPrefix={scriptData.studioUrlPrefix}
              sectionId={section.id}
              sectionName={section.name}
              studentCount={section.students.length}
            />
          )}
        />
      </Router>
    </Provider>,
    document.getElementById('teacher-dashboard')
  );
});
