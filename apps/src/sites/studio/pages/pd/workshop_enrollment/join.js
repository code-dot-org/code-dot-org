import React from 'react';
import ReactDOM from 'react-dom';

import WorkshopJoin from '@cdo/apps/code-studio/pd/workshop_enrollment/WorkshopJoin';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', function () {
  ReactDOM.render(
    <WorkshopJoin {...getScriptData('props')} />,
    document.getElementById('join-workshop-container')
  );
});
