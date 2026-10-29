import React from 'react';

import TeacherconSurvey from '@cdo/apps/code-studio/pd/teachercon_survey/TeacherconSurvey';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', function (event) {
  createReactRoot(
    <TeacherconSurvey {...getScriptData('props')} />,
    document.getElementById('application-container')
  );
});
