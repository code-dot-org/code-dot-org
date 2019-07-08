import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';

import('@cdo/apps/code-studio/pd/fit_weekend_registration/FitWeekendRegistration').then(
  ({default: FitWeekendRegistration}) => {
    $(document).ready(function(event) {
      ReactDOM.render(
        <FitWeekendRegistration {...getScriptData('props')} />,
        document.getElementById('application-container')
      );
    });
  }
);
