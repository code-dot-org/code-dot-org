import React from 'react';
import ReactDOM from 'react-dom';
import ApplicationDashboard from '@cdo/apps/code-studio/pd/application_dashboard/application_dashboard';

document.addEventListener("DOMContentLoaded", function (event) {
  ReactDOM.render(
    <ApplicationDashboard/>,
    document.getElementById('application-container')
  );
});
