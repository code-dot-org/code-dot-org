import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';

import('@cdo/apps/code-studio/pd/workshop_survey/WorkshopSurvey').then(
  ({default: WorkshopSurvey}) => {
    $(document).ready(function(event) {
      ReactDOM.render(
        <WorkshopSurvey {...getScriptData('props')} />,
        document.getElementById('application-container')
      );
    });
  }
);
