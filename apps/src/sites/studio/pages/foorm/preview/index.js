import React from 'react';

import FoormPreviewIndex from '@cdo/apps/code-studio/pd/foorm/FoormPreviewIndex';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', function (event) {
  createReactRoot(
    <FoormPreviewIndex {...getScriptData('props')} />,
    document.getElementById('application-container')
  );
});
