import React from 'react';
import ReactDOM from 'react-dom';
import PreWorkshopSurvey from '@cdo/apps/code-studio/pd/pre_workshop_survey/PreWorkshopSurvey';
import getScriptData from '@cdo/apps/util/getScriptData';
import Foorm from '@cdo/apps/code-studio/pd/foorm/Foorm';

document.addEventListener('DOMContentLoaded', function(event) {
  ReactDOM.render(
    <PreWorkshopSurvey {...getScriptData('props')} />,
    document.getElementById('application-container')
  );

  ReactDOM.render(
    <Foorm {...getScriptData('props')} />,
    document.getElementById('new-application-container')
  );
});
