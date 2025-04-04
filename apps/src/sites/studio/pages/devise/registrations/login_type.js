import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import LoginTypeSelection from '@cdo/apps/signUpFlow/LoginTypeSelection';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const isSignedOut = getScriptData('isSignedOut');
  const inStrictPasswordCountry = getScriptData('inStrictPasswordCountry');
  ReactDOM.render(
    <LoginTypeSelection
      isSignedOut={isSignedOut}
      inStrictPasswordCountry={inStrictPasswordCountry}
    />,
    document.getElementById('login-type-selection')
  );
});
