import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import Foorm from '@cdo/apps/code-studio/pd/foorm/Foorm';

import 'survey-react/survey.css';

document.addEventListener('DOMContentLoaded', function(event) {
  ReactDOM.render(
    <Foorm {...getScriptData('props')} />,
    document.getElementById('application-container')
  );
});
