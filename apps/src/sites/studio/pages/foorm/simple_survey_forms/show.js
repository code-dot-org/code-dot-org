import React from 'react';

import Foorm from '@cdo/apps/code-studio/pd/foorm/Foorm';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

import 'survey-react/survey.css';

document.addEventListener('DOMContentLoaded', function (event) {
  createReactRoot(
    <Foorm {...getScriptData('props')} />,
    document.getElementById('application-container')
  );
});
