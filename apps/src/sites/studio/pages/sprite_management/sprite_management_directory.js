import React from 'react';

import SpriteManagementDirectory from '@cdo/apps/code-studio/assets/SpriteManagementDirectory';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

$(document).ready(function () {
  createReactRoot(
    <SpriteManagementDirectory />,
    document.getElementById('sprite-management-directory-container')
  );
});
