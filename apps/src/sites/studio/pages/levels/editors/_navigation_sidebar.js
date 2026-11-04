import React from 'react';

import NavigationSidebar from '@cdo/apps/lab2/levelEditors/NavigationSidebar';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

document.addEventListener('DOMContentLoaded', () => {
  const mountPoint = document.getElementById('table-of-contents-mount-point');
  if (mountPoint) {
    createReactRoot(<NavigationSidebar />, mountPoint);
  }
});
