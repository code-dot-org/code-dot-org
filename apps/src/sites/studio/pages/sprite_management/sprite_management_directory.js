import React from 'react';
import {createRoot} from 'react-dom/client';

import SpriteManagementDirectory from '@cdo/apps/code-studio/assets/SpriteManagementDirectory';

$(document).ready(function () {
  const root = createRoot(
    document.getElementById('sprite-management-directory-container')
  );
  root.render(<SpriteManagementDirectory />);
});
