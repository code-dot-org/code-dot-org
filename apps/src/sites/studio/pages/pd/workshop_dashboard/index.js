import React from 'react';

import WorkshopDashboard from '@cdo/apps/code-studio/pd/workshop_dashboard/workshop_dashboard';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', function () {
  createReactRoot(
    <WorkshopDashboard {...getScriptData('props')} />,
    document.getElementById('workshop-container')
  );
});
