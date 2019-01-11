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
  toggleSharingColumn,
} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';
import teacherSections, {
  asyncLoadSectionData
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import sectionData, {setSection} from '@cdo/apps/redux/sectionDataRedux';
import TeacherDashboard from '@cdo/apps/templates/teacherDashboard/TeacherDashboard';

const script = document.querySelector('script[data-dashboard]');
const scriptData = JSON.parse(script.dataset.dashboard);
const section = scriptData.section;
const baseUrl = `/teacher_dashboard/sections/${section.id}`;

$(document).ready(function () {
  registerReducers({teacherSections, manageStudents, sectionData});
  const store = getStore();
  store.dispatch(setLoginType(section.login_type));
  store.dispatch(asyncLoadSectionData(section.id));
  store.dispatch(setSection(section));

  // Show share column by default for CSD and CSP courses,
  // or any script in either course.
  const scriptsToShowShareSetting = ["csp-2017", "csp-2018", "csd-2017", "csd-2018", "csd1-2018", "csd2-2018", "csd3-2018", "csd4-2018", "csd5-2018", "csd6-2018", "csd1-2017", "csd2-2017", "csd3-2017", "csd4-2017", "csd5-2017", "csd6-2017", "csp1-2018", "csp2-2018", "csp3-2018", "csp4-2018", "csp-explore-2018", "csp5-2018", "csp-create-2018", "csppostap-2018", "cspunit1", "cspunit2", "cspunit3", "cspunit4", "cspunit5", "cspunit6", "csp1-2017", "csp2-2017", "csp3-2017", "csp4-2017", "csp5-2017", "csp-explore-2017", "csp-create-2017", "csppostap-2017", "csp-post-survey"];

  if (scriptsToShowShareSetting.includes(section.script.name)) {
    store.dispatch(toggleSharingColumn());
  }

  const dataUrl = `/dashboardapi/sections/${section.id}/students`;

  $.ajax({
    method: 'GET',
    url: dataUrl,
    dataType: 'json'
   }).done(studentData => {
    const convertedStudentData = convertStudentServerData(studentData, section.login_type, section.id);
    store.dispatch(setStudents(convertedStudentData));
  });

  ReactDOM.render(
    <Provider store={store}>
      <Router basename={baseUrl}>
        <Route
          path="/"
          component={props => <TeacherDashboard {...props} sectionId={section.id} section={section} studioUrlPrefix=""/>}
        />
      </Router>
    </Provider>,
    document.getElementById('teacher-dashboard')
  );
});
