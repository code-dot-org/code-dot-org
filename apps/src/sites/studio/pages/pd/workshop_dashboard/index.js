import React from 'react';
import {createRoot} from 'react-dom/client';

import WorkshopDashboard from '@cdo/apps/code-studio/pd/workshop_dashboard/workshop_dashboard';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', function () {
  const root = createRoot(document.getElementById('workshop-container'));
  root.render(<WorkshopDashboard {...getScriptData('props')} />);
});
