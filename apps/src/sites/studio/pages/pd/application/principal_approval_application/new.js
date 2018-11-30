import React from 'react';
import ReactDOM from 'react-dom';
import PrincipalApproval1920Application from '@cdo/apps/code-studio/pd/application/principalApproval1920/PrincipalApproval1920Application';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener("DOMContentLoaded", function (event) {
  ReactDOM.render(
    <PrincipalApproval1920Application
      {...getScriptData('props')}
    />,
    document.getElementById('application-container')
  );
});
