import React from 'react';

import DemoSections from '@cdo/apps/templates/admin/DemoSections';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', function () {
  const mountPoint = document.getElementById('demo-sections-container');
  if (mountPoint) {
    const props = getScriptData('props');
    createReactRoot(<DemoSections {...props} />, mountPoint);
  }
});
