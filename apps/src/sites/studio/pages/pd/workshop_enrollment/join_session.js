import React from 'react';
import ReactDOM from 'react-dom';
import JoinSession from '@cdo/apps/code-studio/pd/workshop_enrollment/join_session';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', function () {
  ReactDOM.render(
    <JoinSession {...getScriptData('props')} />,
    document.getElementById('enrollment-container'),
  );
});
