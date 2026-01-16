import React from 'react';

import EnrollmentCancelButton from '@cdo/apps/code-studio/pd/workshop_enrollment/enrollmentCancelButton';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', function () {
  createReactRoot(
    <EnrollmentCancelButton {...getScriptData('props')} />,
    document.getElementById('workshop-container')
  );
});
