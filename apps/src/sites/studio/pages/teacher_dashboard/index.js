import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import TeacherDashboard from '@cdo/apps/templates/teacherDashboard/TeacherDashboard';

const script = document.querySelector('script[data-dashboard]');
const scriptData = JSON.parse(script.dataset.dashboard);
const sectionId = scriptData.section_id;
const baseUrl = `/teacher_dashboard/sections/${sectionId}`;

$(document).ready(function () {
  ReactDOM.render(
    <div>
      <Router basename={baseUrl}>
        <Route
          path="/"
          component={props => <TeacherDashboard {...props} sectionId={sectionId} studioUrlPrefix=""/>}
        />
      </Router>
    </div>
    ,
    document.getElementById('teacher-dashboard')
  );
});
