import React from 'react';
import ReactDOM from 'react-dom';
import PreWorkshopSurvey from '@cdo/apps/code-studio/pd/pre_workshop_survey/PreWorkshopSurvey';
import getScriptData from '@cdo/apps/util/getScriptData';
import Forrm from '@cdo/apps/code-studio/pd/forrm/Forrm';

document.addEventListener('DOMContentLoaded', function(event) {
  ReactDOM.render(
    <PreWorkshopSurvey {...getScriptData('props')} />,
    document.getElementById('application-container')
  );

  ReactDOM.render(
    <Forrm {...getScriptData('props')} />,
    document.getElementById('new-application-container')
  );
});
