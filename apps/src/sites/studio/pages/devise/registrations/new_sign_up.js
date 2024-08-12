import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import LoginTypeSelection from '@cdo/apps/signup/LoginTypeSelection';

$(document).ready(() => {
  ReactDOM.render(<LoginTypeSelection />, document.getElementById('root'));
});
