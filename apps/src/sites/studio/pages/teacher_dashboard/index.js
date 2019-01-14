import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import {Provider} from 'react-redux';
import {getStore, registerReducers} from '@cdo/apps/redux';
import sectionData, {asyncSetSection} from '@cdo/apps/redux/sectionDataRedux';
import stats, {asyncSetCompletedLevelCount} from '@cdo/apps/templates/teacherDashboard/statsRedux';
import TeacherDashboard from '@cdo/apps/templates/teacherDashboard/TeacherDashboard';

const script = document.querySelector('script[data-dashboard]');
const scriptData = JSON.parse(script.dataset.dashboard);
const sectionId = scriptData.section_id;
const baseUrl = `/teacher_dashboard/sections/${sectionId}`;

$(document).ready(function () {
  registerReducers({sectionData, stats});
  const store = getStore();
  store.dispatch(asyncSetSection(sectionId));
  store.dispatch(asyncSetCompletedLevelCount(sectionId));

  ReactDOM.render(
    <Provider store={store}>
      <Router basename={baseUrl}>
        <Route
          path="/"
          component={props => <TeacherDashboard {...props} sectionId={sectionId} studioUrlPrefix=""/>}
        />
      </Router>
    </Provider>
    ,
    document.getElementById('teacher-dashboard')
  );
});
