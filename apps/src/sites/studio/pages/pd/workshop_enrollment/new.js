import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';

import('@cdo/apps/code-studio/pd/workshop_enrollment/workshop_enrollment').then(
  ({default: WorkshopEnrollment}) => {
    $(document).ready(function() {
      ReactDOM.render(
        <WorkshopEnrollment {...getScriptData('props')} />,
        document.getElementById('enrollment-container')
      );
    });
  }
);
