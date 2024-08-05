import React from 'react';
import {createRoot} from 'react-dom/client';

import TeacherconSurvey from '@cdo/apps/code-studio/pd/teachercon_survey/TeacherconSurvey';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', function (event) {
  const root = createRoot(document.getElementById('application-container'));
  root.render(<TeacherconSurvey {...getScriptData('props')} />);
});
