import React from 'react';
import ReactDOM from 'react-dom';
import FacilitatorProgramRegistration from '@cdo/apps/code-studio/pd/facilitator_program_registration/FacilitatorProgramRegistration';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener("DOMContentLoaded", function (event) {
  console.log(getScriptData('options'));
  ReactDOM.render(
    <FacilitatorProgramRegistration
      options={getScriptData('options')}
      apiEndpoint="/api/v1/pd/facilitator_program_registrations"
    />,
    document.getElementById('application-container')
  );
});

