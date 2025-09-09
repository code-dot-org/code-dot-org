import React from 'react';
import ReactDOM from 'react-dom';

import TeacherAccountRequiredPage from '@cdo/apps/templates/gates/TeacherAccountRequiredPage';

document.addEventListener('DOMContentLoaded', function () {
  ReactDOM.render(
    <TeacherAccountRequiredPage />,
    document.getElementById('teacher-account-required-page')
  );
});
