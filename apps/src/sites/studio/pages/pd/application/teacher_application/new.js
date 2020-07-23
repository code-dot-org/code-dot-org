import React from 'react';
import ReactDOM from 'react-dom';
import TeacherApplication from '@cdo/apps/code-studio/pd/application/teacher/TeacherApplication';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', function(event) {
  ReactDOM.render(
    <TeacherApplication {...getScriptData('props')} />,
    document.getElementById('application-container')
  );
});
