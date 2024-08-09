import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import AccountType from '@cdo/apps/signUpFlow/AccountType';

$(document).ready(function () {
  ReactDOM.render(<AccountType />, document.getElementById('account-type'));
});
