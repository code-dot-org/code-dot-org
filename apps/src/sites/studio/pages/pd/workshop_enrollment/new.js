import React from 'react';
import ReactDOM from 'react-dom';
import WorkshopEnrollment from '@cdo/apps/code-studio/pd/workshop_enrollment/workshop_enrollment';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', function () {
  ReactDOM.render(
    <WorkshopEnrollment {...getScriptData('props')} />,
    document.getElementById('enrollment-container'),
  );
});
