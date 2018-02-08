import React from 'react';
import ReactDOM from 'react-dom';
import ApplicationDashboard from '@cdo/apps/code-studio/pd/application_dashboard/application_dashboard';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', function () {
  ReactDOM.render(
    <ApplicationDashboard {...getScriptData('props')} />,
    document.getElementById('application-container'),
  );
});
