import React from 'react';
import {createRoot} from 'react-dom/client';

import InternationalOptIn from '@cdo/apps/code-studio/pd/international_opt_in/InternationalOptIn';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', function (event) {
  const root = createRoot(document.getElementById('application-container'));
  root.render(<InternationalOptIn {...getScriptData('props')} />);
});
