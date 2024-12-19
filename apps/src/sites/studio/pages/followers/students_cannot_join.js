import React from 'react';
import ReactDOM from 'react-dom';

import WorkshopStudentEnrollPage from '@cdo/apps/simpleSignUp/workshop/WorkshopStudentEnrollPage';

document.addEventListener('DOMContentLoaded', function () {
  ReactDOM.render(
    <WorkshopStudentEnrollPage />,
    document.getElementById('followers-students-cannot-join')
  );
});
