import React from 'react';
import {createRoot} from 'react-dom/client';

import TeacherApplication from '@cdo/apps/code-studio/pd/application/teacher/TeacherApplication';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', function (event) {
  const root = createRoot(document.getElementById('application-container'));
  root.render(<TeacherApplication {...getScriptData('props')} />);
});
