import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, Route, withRouter} from 'react-router-dom';
import TeacherDashboard from '@cdo/apps/templates/teacherDashboard/TeacherDashboard';

$(document).ready(function () {
  ReactDOM.render(
    <div>
      <Router  basename="/teacher_dashboard/sections/:section_id">
        <Route path="/" component={withRouter(TeacherDashboard)}/>
      </Router>
    </div>
    ,
    document.getElementById('teacher-dashboard-nav')
  );
});
