import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';

import('@cdo/apps/code-studio/pd/teachercon_survey/TeacherconSurvey').then(
  ({default: TeacherconSurvey}) => {
    $(document).ready(function(event) {
      ReactDOM.render(
        <TeacherconSurvey {...getScriptData('props')} />,
        document.getElementById('application-container')
      );
    });
  }
);
