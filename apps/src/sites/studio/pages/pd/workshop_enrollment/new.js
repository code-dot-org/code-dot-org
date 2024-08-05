import React from 'react';
import {createRoot} from 'react-dom/client';

import WorkshopEnroll from '@cdo/apps/code-studio/pd/workshop_enrollment/workshop_enroll';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', function () {
  const root = createRoot(document.getElementById('enrollment-container'));
  root.render(<WorkshopEnroll {...getScriptData('props')} />);
});
