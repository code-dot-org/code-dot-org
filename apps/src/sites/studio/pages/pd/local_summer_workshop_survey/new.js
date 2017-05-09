import React from 'react';
import ReactDOM from 'react-dom';
import LocalSummerWorkshopSurvey from '@cdo/apps/code-studio/pd/local_summer_workshop_survey/LocalSummerWorkshopSurvey';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener("DOMContentLoaded", function (event) {
  ReactDOM.render(
    <LocalSummerWorkshopSurvey
      options={getScriptData('options')}
      day={getScriptData('day')}
      apiEndpoint="/api/v1/pd/local_summer_workshop_surveys"
    />,
    document.getElementById('application-container')
  );
});

