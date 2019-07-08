import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';

import('@cdo/apps/code-studio/pd/pre_workshop_survey/PreWorkshopSurvey').then(
  ({default: PreWorkshopSurvey}) => {
    $(document).ready(function(event) {
      ReactDOM.render(
        <PreWorkshopSurvey {...getScriptData('props')} />,
        document.getElementById('application-container')
      );
    });
  }
);
