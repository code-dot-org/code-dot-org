import React from 'react';
import {createRoot} from 'react-dom/client';

import PreWorkshopSurvey from '@cdo/apps/code-studio/pd/pre_workshop_survey/PreWorkshopSurvey';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', function (event) {
  const root = createRoot(document.getElementById('application-container'));
  root.render(<PreWorkshopSurvey {...getScriptData('props')} />);
});
