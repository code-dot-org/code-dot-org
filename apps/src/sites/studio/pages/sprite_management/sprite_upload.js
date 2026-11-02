import React from 'react';

import SpriteUpload from '@cdo/apps/code-studio/assets/SpriteUpload';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

$(document).ready(function () {
  createReactRoot(
    <SpriteUpload />,
    document.getElementById('sprite-upload-container')
  );
});
