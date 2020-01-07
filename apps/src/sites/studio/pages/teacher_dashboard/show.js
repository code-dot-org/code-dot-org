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
  setStageExtrasScriptIds,
  setValidAssignments,
  setValidGrades
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import sectionData, {setSection} from '@cdo/apps/redux/sectionDataRedux';
import stats from '@cdo/apps/templates/teacherDashboard/statsRedux';
import textResponses from '@cdo/apps/templates/textResponses/textResponsesRedux';
import sectionAssessments from '@cdo/apps/templates/sectionAssessments/sectionAssessmentsRedux';
import sectionProgress from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import scriptSelection from '@cdo/apps/redux/scriptSelectionRedux';
import TeacherDashboard from '@cdo/apps/templates/teacherDashboard/TeacherDashboard';
import currentUser, {
  setCurrentUserId
} from '@cdo/apps/templates/currentUserRedux';
import {setValidScripts} from '../../../../redux/scriptSelectionRedux';

const script = document.querySelector('script[data-dashboard]');
const scriptData = JSON.parse(script.dataset.dashboard);
const section = scriptData.section;
const sections = scriptData.sections;
const validGrades = scriptData.validGrades;
const validScripts = scriptData.validScripts;
const studentScriptIds = scriptData.studentScriptIds;
const validCourses = scriptData.validCourses;
const currentUserId = scriptData.currentUserId;
const baseUrl = `/teacher_dashboard/sections/${section.id}`;

//TODO
$(document).ready(function() {
  registerReducers({
    teacherSections,
    sectionData,
    manageStudents,
    sectionProgress,
    scriptSelection,
    stats,
    textResponses,
    sectionAssessments,
    currentUser
  });
  const store = getStore();
  // TODO: (madelynkasula) remove duplication in sectionData.setSection and teacherSections.setSections
  store.dispatch(setCurrentUserId(currentUserId));
  store.dispatch(setSection(section));
  store.dispatch(setSections(sections));
  store.dispatch(selectSection(section.id));
  store.dispatch(setRosterProvider(section.login_type));
  store.dispatch(setLoginType(section.login_type));
  store.dispatch(setValidAssignments(validCourses, validScripts));
  store.dispatch(setValidGrades(validGrades));

  if (!section.sharing_disabled && section.script.project_sharing) {
    store.dispatch(setShowSharingColumn(true));
  }

  store.dispatch(
    setValidScripts(
      validScripts
    )
  );

  ReactDOM.render(
    <Provider store={store}>
      <Router basename={baseUrl}>
        <Route
          path="/"
          component={props => (
            <TeacherDashboard
              {...props}
              studioUrlPrefix={scriptData.studioUrlPrefix}
              pegasusUrlPrefix={scriptData.pegasusUrlPrefix}
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
