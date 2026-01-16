import $ from 'jquery';
import React from 'react';

import FinishTeacherAccount from '@cdo/apps/signUpFlow/FinishTeacherAccount';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const usIp = getScriptData('usIp');
  const countryCode = getScriptData('countryCode');
  const redirectUrl = getScriptData('redirectUrl');
  createReactRoot(
    <FinishTeacherAccount
      usIp={usIp}
      countryCode={countryCode}
      redirectUrl={redirectUrl}
    />,
    document.getElementById('finish-teacher-account-root')
  );
});
