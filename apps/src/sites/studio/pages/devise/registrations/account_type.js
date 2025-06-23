import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import AccountType from '@cdo/apps/signUpFlow/AccountType';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const isSignedOut = getScriptData('isSignedOut');
  ReactDOM.render(
    <AccountType isSignedOut={isSignedOut} />,
    document.getElementById('account-type')
  );
});
