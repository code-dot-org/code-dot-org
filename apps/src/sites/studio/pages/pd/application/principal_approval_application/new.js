import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';

import('@cdo/apps/code-studio/pd/application/principalApproval1920/PrincipalApproval1920Application').then(
  PrincipalApproval1920Application => {
    $(document).ready(function(event) {
      ReactDOM.render(
        <PrincipalApproval1920Application {...getScriptData('props')} />,
        document.getElementById('application-container')
      );
    });
  }
);
