import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import TeacherDashboardNavigation from '@cdo/apps/templates/teacherDashboard/TeacherDashboardNavigation';

$(document).ready(function () {
  const defaultTab = "progress";
  const possibleTabs = [
    "progress",
    "stats",
    "manage_students",
    "assessments",
    "projects",
    "text_responses"
  ];
  const urlEnding = window.location.pathname.split('/').pop();
  const currentTab = possibleTabs.includes(urlEnding) ? urlEnding : defaultTab;

  ReactDOM.render(
    <div>
      <TeacherDashboardNavigation
        defaultActiveLink={currentTab}
      />
    </div>,
    document.getElementById('teacher-dashboard-nav')
  );
});
