import React from 'react';

import DefaultSpritesEditor from '@cdo/apps/code-studio/assets/DefaultSpritesEditor';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

$(document).ready(function () {
  createReactRoot(
    <DefaultSpritesEditor />,
    document.getElementById('default-sprites-editor-container')
  );
});
