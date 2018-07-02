import React from 'react';
import ReactDOM from 'react-dom';
import WorkshopDashboard from '@cdo/apps/code-studio/pd/workshop_dashboard/workshop_dashboard';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', function () {
  ReactDOM.render(
    <WorkshopDashboard {...getScriptData('props')} />,
    document.getElementById('workshop-container'),
  );
});
