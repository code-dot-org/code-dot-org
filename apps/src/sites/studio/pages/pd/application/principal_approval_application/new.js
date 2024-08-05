import React from 'react';
import {createRoot} from 'react-dom/client';

import PrincipalApprovalApplication from '@cdo/apps/code-studio/pd/application/principalApproval/PrincipalApprovalApplication';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', function (event) {
  const root = createRoot(document.getElementById('application-container'));
  root.render(<PrincipalApprovalApplication {...getScriptData('props')} />);
});
