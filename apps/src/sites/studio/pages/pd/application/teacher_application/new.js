import React from 'react';
import ReactDOM from 'react-dom';
import Teacher1819Application from '@cdo/apps/code-studio/pd/application/teacher1819/Teacher1819Application';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener("DOMContentLoaded", function (event) {
  ReactDOM.render(
    <Teacher1819Application
      {...getScriptData('props')}
    />,
    document.getElementById('application-container')
  );
});
