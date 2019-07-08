import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';

import('@cdo/apps/code-studio/pd/application_dashboard/application_dashboard').then(
  ({default: ApplicationDashboard}) => {
    $(document).ready(function() {
      ReactDOM.render(
        <ApplicationDashboard {...getScriptData('props')} />,
        document.getElementById('application-container')
      );
    });
  }
);
