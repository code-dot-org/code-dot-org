import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import FinishStudentAccount from '@cdo/apps/signUpFlow/FinishStudentAccount';

$(document).ready(() => {
  ReactDOM.render(
    <FinishStudentAccount />,
    document.getElementById('finish-student-account-root')
  );
});
