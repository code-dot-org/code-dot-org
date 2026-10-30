import React from 'react';

import MassDeleteContainer from '@cdo/apps/templates/admin/MassDeleteContainer';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

document.addEventListener('DOMContentLoaded', function () {
  const mountPoint = document.getElementById('mass-delete-container');
  if (mountPoint) {
    createReactRoot(<MassDeleteContainer />, mountPoint);
  }
});
