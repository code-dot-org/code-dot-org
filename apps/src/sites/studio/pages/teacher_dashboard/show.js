import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import {Provider} from 'react-redux';
import {getStore, registerReducers} from '@cdo/apps/redux';
import manageStudents, {
  setLoginType,
  setStudents,
  convertStudentServerData,
  setShowSharingColumn
} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';
import teacherSections, {
  setSections,
  selectSection,
  setRosterProvider
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import sectionData, {setSection} from '@cdo/apps/redux/sectionDataRedux';
import stats, {
  asyncSetCompletedLevelCount
} from '@cdo/apps/templates/teacherDashboard/statsRedux';
import textResponses, {
  asyncLoadTextResponses
} from '@cdo/apps/templates/textResponses/textResponsesRedux';
import sectionAssessments from '@cdo/apps/templates/sectionAssessments/sectionAssessmentsRedux';
import sectionProgress from '@cdo/apps/templates/sectionProgress/sectionProgressRedux';
import scriptSelection, {
  loadValidScripts
} from '@cdo/apps/redux/scriptSelectionRedux';
import TeacherDashboard from '@cdo/apps/templates/teacherDashboard/TeacherDashboard';

const script = document.querySelector('script[data-dashboard]');
const scriptData = JSON.parse(script.dataset.dashboard);
const section = scriptData.section;
const sections = scriptData.sections;
const baseUrl = `/teacher_dashboard/sections/${section.id}`;

$(document).ready(function() {
  registerReducers({
    teacherSections,
    sectionData,
    manageStudents,
    sectionProgress,
    scriptSelection,
    stats,
    textResponses,
    sectionAssessments
  });
  const store = getStore();
  // TODO: (madelynkasula) remove duplication in sectionData.setSection and teacherSections.setSections
  store.dispatch(setSection(section));
  store.dispatch(setSections(sections));

  store.dispatch(selectSection(section.id));
  store.dispatch(setRosterProvider(section.login_type));
  store.dispatch(setLoginType(section.login_type));
  store.dispatch(asyncSetCompletedLevelCount(section.id));

  if (!section.sharing_disabled && section.script.project_sharing) {
    store.dispatch(setShowSharingColumn(true));
  }

  $.ajax({
    method: 'GET',
    url: `/dashboardapi/sections/${section.id}/students`,
    dataType: 'json'
  }).done(studentData => {
    const convertedStudentData = convertStudentServerData(
      studentData,
      section.login_type,
      section.id
    );
    store.dispatch(setStudents(convertedStudentData));
  });

  $.ajax({
    method: 'GET',
    url: '/dashboardapi/sections/valid_scripts',
    dataType: 'json'
  }).done(validScripts => {
    store.dispatch(loadValidScripts(section, validScripts)).then(() => {
      const scriptId = store.getState().scriptSelection.scriptId;
      store.dispatch(asyncLoadTextResponses(section.id, scriptId));

      renderTeacherDashboard();
    });
  });

  const renderTeacherDashboard = () => {
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
              />
            )}
          />
        </Router>
      </Provider>,
      document.getElementById('teacher-dashboard')
    );
  };
});
