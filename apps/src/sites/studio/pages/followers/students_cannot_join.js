import React from 'react';
import ReactDOM from 'react-dom';

import StudentUserTypeChangePrompt from '@cdo/apps/accounts/StudentUserTypeChangePrompt';
import getScriptData from '@cdo/apps/util/getScriptData';

const {sectionCode} = getScriptData('studentCannotJoin');

const userReturnTo = sectionCode ? `/join/${sectionCode}` : undefined;

document.addEventListener('DOMContentLoaded', function () {
  ReactDOM.render(
    <StudentUserTypeChangePrompt userReturnTo={userReturnTo} />,
    document.getElementById('followers-students-cannot-join')
  );
});
