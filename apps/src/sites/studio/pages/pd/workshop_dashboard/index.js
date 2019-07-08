import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';

import('@cdo/apps/code-studio/pd/workshop_dashboard/workshop_dashboard').then(
  ({default: WorkshopDashboard}) => {
    $(document).ready(function() {
      ReactDOM.render(
        <WorkshopDashboard {...getScriptData('props')} />,
        document.getElementById('workshop-container')
      );
    });
  }
);
