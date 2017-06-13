import React from 'react';
import ReactDOM from 'react-dom';
import TeacherconSurvey from '@cdo/apps/code-studio/pd/teachercon_survey/TeacherconSurvey';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener("DOMContentLoaded", function (event) {
  ReactDOM.render(
    <TeacherconSurvey
      {...getScriptData('props')}
    />,
    document.getElementById('application-container')
  );
});
