import React from 'react';
import ReactDOM from 'react-dom';
import Teacher2021Application from '@cdo/apps/code-studio/pd/application/teacher2021/Teacher2021Application';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', function(event) {
  ReactDOM.render(
    <Teacher2021Application {...getScriptData('props')} />,
    document.getElementById('application-container')
  );
});
