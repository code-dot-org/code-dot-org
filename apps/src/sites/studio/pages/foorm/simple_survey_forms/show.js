import React from 'react';
import {createRoot} from 'react-dom/client';

import Foorm from '@cdo/apps/code-studio/pd/foorm/Foorm';
import getScriptData from '@cdo/apps/util/getScriptData';

import 'survey-react/survey.css';

document.addEventListener('DOMContentLoaded', function (event) {
  const root = createRoot(document.getElementById('application-container'));
  root.render(<Foorm {...getScriptData('props')} />);
});
