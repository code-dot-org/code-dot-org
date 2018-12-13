import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import TeacherDashboardNavigation from '@cdo/apps/templates/teacherDashboard/TeacherDashboardNavigation';

$(document).ready(function () {
  const script = document.querySelector('script[data-dashboard]');
  const teacherDashboardData = JSON.parse(script.dataset.dashboard);
  const selectedTab = teacherDashboardData.selected_tab;
  const defaultTab = "progress";
  const allTabs = [
    "progress",
    "stats",
    "manage_students",
    "assessments",
    "projects",
    "text_responses"
  ];
  const currentTab = allTabs.includes(selectedTab) ? selectedTab : defaultTab;

  ReactDOM.render(
    <div>
      <TeacherDashboardNavigation
        defaultActiveLink={currentTab}
      />
    </div>,
    document.getElementById('teacher-dashboard-nav')
  );
});
