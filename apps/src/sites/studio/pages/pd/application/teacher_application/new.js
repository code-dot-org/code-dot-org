import React from 'react';
import ReactDOM from 'react-dom';
import Teacher1920Application from '@cdo/apps/code-studio/pd/application/teacher1920/Teacher1920Application';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener("DOMContentLoaded", function (event) {
  ReactDOM.render(
    <Teacher1920Application
      {...getScriptData('props')}
    />,
    document.getElementById('application-container')
  );
});
