import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import LoginTypeSelection from '@cdo/apps/signUpFlow/LoginTypeSelection';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const isSignedOut = getScriptData('isSignedOut');
  ReactDOM.render(
    <LoginTypeSelection isSignedOut={isSignedOut} />,
    document.getElementById('login-type-selection')
  );
});
