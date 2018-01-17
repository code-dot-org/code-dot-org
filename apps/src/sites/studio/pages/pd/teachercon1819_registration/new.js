import React from 'react';
import ReactDOM from 'react-dom';
import Teachercon1819Registration from '@cdo/apps/code-studio/pd/teachercon1819_registration/Teachercon1819Registration';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener("DOMContentLoaded", function (event) {
  ReactDOM.render(
    <Teachercon1819Registration
      {...getScriptData('props')}
    />,
    document.getElementById('application-container')
  );
});

