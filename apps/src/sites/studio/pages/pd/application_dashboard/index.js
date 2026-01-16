import React from 'react';

import ApplicationDashboard from '@cdo/apps/code-studio/pd/application_dashboard/application_dashboard';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', function () {
  createReactRoot(
    <ApplicationDashboard {...getScriptData('props')} />,
    document.getElementById('application-container')
  );
});
