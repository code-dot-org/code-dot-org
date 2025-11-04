import React from 'react';

import PrincipalApprovalApplication from '@cdo/apps/code-studio/pd/application/principalApproval/PrincipalApprovalApplication';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', function (event) {
  createReactRoot(
    <PrincipalApprovalApplication {...getScriptData('props')} />,
    document.getElementById('application-container')
  );
});
