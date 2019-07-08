import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';

import('@cdo/apps/code-studio/pd/international_opt_in/InternationalOptIn').then(
  ({default: InternationalOptIn}) => {
    $(document).ready(function(event) {
      ReactDOM.render(
        <InternationalOptIn {...getScriptData('props')} />,
        document.getElementById('application-container')
      );
    });
  }
);
