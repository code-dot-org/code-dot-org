import React from 'react';
import ReactDOM from 'react-dom';
import FacilitatorApplication from '@cdo/apps/code-studio/pd/application/facilitator/FacilitatorApplication';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', function(event) {
  ReactDOM.render(
    <FacilitatorApplication {...getScriptData('props')} />,
    document.getElementById('application-container')
  );
});
