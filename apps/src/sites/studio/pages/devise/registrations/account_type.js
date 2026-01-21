import { createRoot } from "react-dom/client";
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import AccountType from '@cdo/apps/signUpFlow/AccountType';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const isSignedOut = getScriptData('isSignedOut');
  const root = createRoot(document.getElementById('account-type'));
  root.render(<AccountType isSignedOut={isSignedOut} />);
});
