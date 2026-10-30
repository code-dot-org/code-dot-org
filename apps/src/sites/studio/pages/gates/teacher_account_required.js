import React from 'react';

import TeacherAccountRequiredPage from '@cdo/apps/templates/gates/TeacherAccountRequiredPage';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

document.addEventListener('DOMContentLoaded', function () {
  createReactRoot(
    <TeacherAccountRequiredPage />,
    document.getElementById('teacher-account-required-page')
  );
});
