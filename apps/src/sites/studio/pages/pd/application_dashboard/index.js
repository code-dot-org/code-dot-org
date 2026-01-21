import { createRoot } from "react-dom/client";
import React from 'react';
import ReactDOM from 'react-dom';

import ApplicationDashboard from '@cdo/apps/code-studio/pd/application_dashboard/application_dashboard';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', function () {
  const root = createRoot(document.getElementById('application-container'));
  root.render(<ApplicationDashboard {...getScriptData('props')} />);
});
