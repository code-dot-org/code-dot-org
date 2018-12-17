import React from 'react';
import ReactDOM from 'react-dom';
import FitWeekendRegistration from '@cdo/apps/code-studio/pd/fit_weekend_registration/FitWeekendRegistration';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener("DOMContentLoaded", function (event) {
  ReactDOM.render(
    <FitWeekendRegistration
      {...getScriptData('props')}
    />,
    document.getElementById('application-container')
  );
});
