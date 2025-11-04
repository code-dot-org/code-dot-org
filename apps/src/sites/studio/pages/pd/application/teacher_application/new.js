import React from 'react';

import TeacherApplication from '@cdo/apps/code-studio/pd/application/teacher/TeacherApplication';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', function (event) {
  createReactRoot(
    <TeacherApplication {...getScriptData('props')} />,
    document.getElementById('application-container')
  );
});
