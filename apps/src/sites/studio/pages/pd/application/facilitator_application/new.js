import React from 'react';
import ReactDOM from 'react-dom';
import Facilitator1920Application from '@cdo/apps/code-studio/pd/application/facilitator1920/Facilitator1920Application';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener("DOMContentLoaded", function (event) {
  ReactDOM.render(
    <Facilitator1920Application
      {...getScriptData('props')}
    />,
    document.getElementById('application-container')
  );
});
