import React from 'react';
import ReactDOM from 'react-dom';
import WorkshopSurvey from '@cdo/apps/code-studio/pd/workshop_survey/WorkshopSurvey';
import {getCurrentScriptData} from '@cdo/apps/util/getScriptData';

const data = getCurrentScriptData();

document.addEventListener("DOMContentLoaded", function (event) {
  ReactDOM.render(
    <WorkshopSurvey
      {...data}
    />,
    document.getElementById('application-container')
  );
});
