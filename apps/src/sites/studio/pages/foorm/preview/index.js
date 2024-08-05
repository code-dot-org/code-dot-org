import React from 'react';
import {createRoot} from 'react-dom/client';

import FoormPreviewIndex from '@cdo/apps/code-studio/pd/foorm/FoormPreviewIndex';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', function (event) {
  const root = createRoot(document.getElementById('application-container'));
  root.render(<FoormPreviewIndex {...getScriptData('props')} />);
});
