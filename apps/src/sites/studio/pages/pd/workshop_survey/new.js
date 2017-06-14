import React from 'react';
import ReactDOM from 'react-dom';
import WorkshopSurvey from '@cdo/apps/code-studio/pd/workshop_survey/WorkshopSurvey';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener("DOMContentLoaded", function (event) {
  ReactDOM.render(
    <WorkshopSurvey
      {...getScriptData('props')}
    />,
    document.getElementById('application-container')
  );
});
