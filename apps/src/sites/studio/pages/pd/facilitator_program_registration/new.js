import React from 'react';
import ReactDOM from 'react-dom';
import FacilitatorProgramRegistration from '@cdo/apps/code-studio/pd/facilitator_program_registration/FacilitatorProgramRegistration';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener("DOMContentLoaded", function (event) {
  ReactDOM.render(
    <FacilitatorProgramRegistration
      {...getScriptData('props')}
    />,
    document.getElementById('application-container')
  );
});

