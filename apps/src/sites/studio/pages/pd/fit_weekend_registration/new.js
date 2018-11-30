import React from 'react';
import ReactDOM from 'react-dom';
import FitWeekend1819Registration from '@cdo/apps/code-studio/pd/fit_weekend1819_registration/FitWeekend1819Registration';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener("DOMContentLoaded", function (event) {
  ReactDOM.render(
    <FitWeekend1819Registration
      {...getScriptData('props')}
    />,
    document.getElementById('application-container')
  );
});
