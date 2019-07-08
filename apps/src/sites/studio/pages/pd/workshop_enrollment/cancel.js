import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';

import('@cdo/apps/code-studio/pd/workshop_enrollment/enrollmentCancelButton').then(
  ({default: EnrollmentCancelButton}) => {
    $(document).ready(function() {
      ReactDOM.render(
        <EnrollmentCancelButton {...getScriptData('props')} />,
        document.getElementById('workshop-container')
      );
    });
  }
);
