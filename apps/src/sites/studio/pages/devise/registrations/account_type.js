import $ from 'jquery';
import React from 'react';

import AccountType from '@cdo/apps/signUpFlow/AccountType';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const isSignedOut = getScriptData('isSignedOut');
  createReactRoot(
    <AccountType isSignedOut={isSignedOut} />,
    document.getElementById('account-type')
  );
});
