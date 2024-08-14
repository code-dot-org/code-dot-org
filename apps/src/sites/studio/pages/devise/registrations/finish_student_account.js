import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import FinishStudentAccount from '@cdo/apps/signUpFlow/FinishStudentAccount';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const ageOptions = getScriptData('ageOptions');
  const usStateOptions = getScriptData('usStateOptions');

  ReactDOM.render(
    <FinishStudentAccount
      ageOptions={ageOptions}
      usStateOptions={usStateOptions}
    />,
    document.getElementById('finish-student-account-root')
  );
});
