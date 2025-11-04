import React from 'react';

import LinkAccountPage from '@cdo/apps/templates/gates/LinkAccountPage';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

document.addEventListener('DOMContentLoaded', function () {
  createReactRoot(
    <LinkAccountPage />,
    document.getElementById('logged-out-page')
  );
});
