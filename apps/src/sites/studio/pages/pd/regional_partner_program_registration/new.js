import React from 'react';
import ReactDOM from 'react-dom';
import RegionalPartnerProgramRegistration from '@cdo/apps/code-studio/pd/regional_partner_program_registration/RegionalPartnerProgramRegistration';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener("DOMContentLoaded", function (event) {
  ReactDOM.render(
    <RegionalPartnerProgramRegistration
      {...getScriptData('props')}
    />,
    document.getElementById('application-container')
  );
});

