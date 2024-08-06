import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import FinishTeacherAccount from '@cdo/apps/signUpFlow/FinishTeacherAccount';

$(document).ready(() => {
  ReactDOM.render(<FinishTeacherAccount />, document.getElementById('root'));
});
