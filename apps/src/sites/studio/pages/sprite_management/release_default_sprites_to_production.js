import React from 'react';

import ReleaseDefaultSprites from '@cdo/apps/code-studio/assets/ReleaseDefaultSprites';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

$(document).ready(function () {
  createReactRoot(
    <ReleaseDefaultSprites />,
    document.getElementById('release-default-sprites-to-production-container')
  );
});
