import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';

import('@cdo/apps/code-studio/pd/application/facilitator1920/Facilitator1920Application').then(
  ({default: Facilitator1920Application}) => {
    $(document).ready(function(event) {
      ReactDOM.render(
        <Facilitator1920Application {...getScriptData('props')} />,
        document.getElementById('application-container')
      );
    });
  }
);
