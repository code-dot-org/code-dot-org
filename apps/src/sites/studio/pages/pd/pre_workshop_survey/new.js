import React from 'react';
import ReactDOM from 'react-dom';
import PreWorkshopSurvey from '@cdo/apps/code-studio/pd/pre_workshop_survey/PreWorkshopSurvey';
import getScriptData from '@cdo/apps/util/getScriptData';

function render() {
  ReactDOM.render(
    <PreWorkshopSurvey
      {...getScriptData('props')}
    />,
    document.getElementById('application-container')
  );
}

document.addEventListener("DOMContentLoaded", function (event) {
  render();
});
