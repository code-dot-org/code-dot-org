import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import FinishStudentAccount from '@cdo/apps/signUpFlow/FinishStudentAccount';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const ageOptions = getScriptData('ageOptions');
  const usIp = getScriptData('usIp');
  const usStateOptions = getScriptData('usStateOptions');
  const countryCode = getScriptData('countryCode');

  ReactDOM.render(
    <FinishStudentAccount
      ageOptions={ageOptions}
      usIp={usIp}
      countryCode={countryCode}
      usStateOptions={usStateOptions}
    />,
    document.getElementById('finish-student-account-root')
  );
});
