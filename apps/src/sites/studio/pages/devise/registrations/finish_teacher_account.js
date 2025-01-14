import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import FinishTeacherAccount from '@cdo/apps/signUpFlow/FinishTeacherAccount';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const usIp = getScriptData('usIp');
  const countryCode = getScriptData('countryCode');
  const redirectUrl = getScriptData('redirectUrl');
  ReactDOM.render(
    <FinishTeacherAccount
      usIp={usIp}
      countryCode={countryCode}
      redirectUrl={redirectUrl}
    />,
    document.getElementById('finish-teacher-account-root')
  );
});
