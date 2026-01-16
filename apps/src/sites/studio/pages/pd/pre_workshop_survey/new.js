import React from 'react';

import PreWorkshopSurvey from '@cdo/apps/code-studio/pd/pre_workshop_survey/PreWorkshopSurvey';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', function (event) {
  createReactRoot(
    <PreWorkshopSurvey {...getScriptData('props')} />,
    document.getElementById('application-container')
  );
});
