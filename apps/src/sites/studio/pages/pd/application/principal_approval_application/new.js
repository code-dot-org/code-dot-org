import React from 'react';
import ReactDOM from 'react-dom';
import PrincipalApproval2021Application from '@cdo/apps/code-studio/pd/application/principalApproval2021/PrincipalApproval2021Application';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', function(event) {
  ReactDOM.render(
    <PrincipalApproval2021Application {...getScriptData('props')} />,
    document.getElementById('application-container')
  );
});
