import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import StudentTeacherAccount from '@cdo/apps/signUpFlow/StudentTeacherAccount';

$(document).ready(() => {
  ReactDOM.render(
    <StudentTeacherAccount />,
    document.getElementById('finish-student-account-root')
  );
});
