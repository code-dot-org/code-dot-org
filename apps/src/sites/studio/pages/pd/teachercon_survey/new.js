import React from 'react';
import ReactDOM from 'react-dom';
import TeacherconSurvey from '@cdo/apps/code-studio/pd/teachercon_survey/TeacherconSurvey';
import {getCurrentScriptData} from '@cdo/apps/util/getScriptData';

const data = getCurrentScriptData();

document.addEventListener("DOMContentLoaded", function (event) {
  ReactDOM.render(
    <TeacherconSurvey
      {...data.props}
    />,
    document.getElementById('application-container')
  );
});
