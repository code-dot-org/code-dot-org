import React from 'react';

import InternationalOptIn from '@cdo/apps/code-studio/pd/international_opt_in/InternationalOptIn';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', function (event) {
  createReactRoot(
    <InternationalOptIn {...getScriptData('props')} />,
    document.getElementById('application-container')
  );
});
