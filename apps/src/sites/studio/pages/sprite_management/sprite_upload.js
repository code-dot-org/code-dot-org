import React from 'react';
import {createRoot} from 'react-dom/client';

import SpriteUpload from '@cdo/apps/code-studio/assets/SpriteUpload';

$(document).ready(function () {
  const root = createRoot(document.getElementById('sprite-upload-container'));
  root.render(<SpriteUpload />);
});
