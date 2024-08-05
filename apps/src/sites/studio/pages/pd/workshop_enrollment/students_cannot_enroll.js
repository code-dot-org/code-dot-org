import React from 'react';
import ReactDOM from 'react-dom';

import WorkshopStudentEnrollPage from '@cdo/apps/lib/ui/simpleSignUp/workshop/WorkshopStudentEnrollPage';

document.addEventListener('DOMContentLoaded', function () {
  ReactDOM.render(
    <WorkshopStudentEnrollPage />,
    document.getElementById('workshop-enroll-students-cannot-enroll')
  );
});
