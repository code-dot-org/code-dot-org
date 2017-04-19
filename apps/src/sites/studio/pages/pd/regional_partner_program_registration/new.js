import React from 'react';
import ReactDOM from 'react-dom';
import RegionalPartnerProgramRegistration from '@cdo/apps/code-studio/pd/regional_partner_program_registration/RegionalPartnerProgramRegistration';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener("DOMContentLoaded", function (event) {
  ReactDOM.render(
    <RegionalPartnerProgramRegistration
      options={getScriptData('options')}
      teachercon={getScriptData('teachercon')}
      teacherconLocation={getScriptData('teacherconLocation')}
      teacherconDates={getScriptData('teacherconDates')}
      apiEndpoint="/api/v1/pd/regional_partner_program_registrations"
    />,
    document.getElementById('application-container')
  );
});

