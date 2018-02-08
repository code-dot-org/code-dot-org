import React from 'react';
import ReactDOM from 'react-dom';
import Facilitator1819Application from '@cdo/apps/code-studio/pd/application/facilitator1819/Facilitator1819Application';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener("DOMContentLoaded", function (event) {
  ReactDOM.render(
    <Facilitator1819Application
      {...getScriptData('props')}
    />,
    document.getElementById('application-container')
  );
});
