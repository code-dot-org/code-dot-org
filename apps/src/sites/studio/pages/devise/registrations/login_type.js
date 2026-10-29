import $ from 'jquery';
import React from 'react';

import LoginTypeSelection from '@cdo/apps/signUpFlow/LoginTypeSelection';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const isSignedOut = getScriptData('isSignedOut');
  const passwordMinLength = getScriptData('passwordMinLength');
  createReactRoot(
    <LoginTypeSelection
      isSignedOut={isSignedOut}
      passwordMinLength={passwordMinLength}
    />,
    document.getElementById('login-type-selection')
  );
});
