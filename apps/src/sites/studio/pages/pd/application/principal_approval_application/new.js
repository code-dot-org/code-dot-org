import React from 'react';
import ReactDOM from 'react-dom';
import PrincipalApproval1819Application from '@cdo/apps/code-studio/pd/application/principalApproval1819/PrincipalApproval1819Application';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener("DOMContentLoaded", function (event) {
  ReactDOM.render(
    <PrincipalApproval1819Application
      {...getScriptData('props')}
    />,
    document.getElementById('application-container')
  );
});

