import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import LoginTypeSelection from '@cdo/apps/signUpFlow/LoginTypeSelection';

$(document).ready(() => {
  ReactDOM.render(
    <LoginTypeSelection />,
    document.getElementById('login-type-selection')
  );
});
