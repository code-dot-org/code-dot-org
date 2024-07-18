import React from 'react';
import {createRoot} from 'react-dom/client';

import DefaultSpritesEditor from '@cdo/apps/code-studio/assets/DefaultSpritesEditor';

$(document).ready(function () {
  const root = createRoot(
    document.getElementById('default-sprites-editor-container')
  );
  root.render(<DefaultSpritesEditor />);
});
