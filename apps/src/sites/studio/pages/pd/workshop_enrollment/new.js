import React from 'react';
import ReactDOM from 'react-dom';

import WorkshopEnroll from '@cdo/apps/code-studio/pd/workshop_enrollment/workshop_enroll';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', function () {
  ReactDOM.render(
    <WorkshopEnroll {...getScriptData('props')} />,
    document.getElementById('enrollment-container')
  );
});
