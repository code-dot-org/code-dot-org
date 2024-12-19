import React from 'react';
import ReactDOM from 'react-dom';

import WorkshopStudentEnrollPage from '@cdo/apps/simpleSignUp/workshop/WorkshopStudentEnrollPage';
import getScriptData from '@cdo/apps/util/getScriptData';

const {sectionCode} = getScriptData('studentCannotJoin');

const userReturnTo = sectionCode ? `/join/${sectionCode}` : undefined;

document.addEventListener('DOMContentLoaded', function () {
  ReactDOM.render(
    <WorkshopStudentEnrollPage userReturnTo={userReturnTo} />,
    document.getElementById('followers-students-cannot-join')
  );
});
