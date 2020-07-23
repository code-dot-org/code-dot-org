import React from 'react';
import ReactDOM from 'react-dom';
import PrincipalApprovalApplication from '@cdo/apps/code-studio/pd/application/principalApproval/PrincipalApprovalApplication';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', function(event) {
  ReactDOM.render(
    <PrincipalApprovalApplication {...getScriptData('props')} />,
    document.getElementById('application-container')
  );
});
