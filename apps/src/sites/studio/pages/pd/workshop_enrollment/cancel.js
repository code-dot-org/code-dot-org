import React from 'react';
import ReactDOM from 'react-dom';

import EnrollmentCancelButton from '@cdo/apps/code-studio/pd/workshop_enrollment/enrollmentCancelButton';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', function () {
  ReactDOM.render(
    <EnrollmentCancelButton {...getScriptData('props')} />,
    document.getElementById('workshop-container')
  );
});
