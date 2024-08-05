import React from 'react';
import {createRoot} from 'react-dom/client';

import ReleaseDefaultSprites from '@cdo/apps/code-studio/assets/ReleaseDefaultSprites';

$(document).ready(function () {
  const root = createRoot(
    document.getElementById('release-default-sprites-to-production-container')
  );
  root.render(<ReleaseDefaultSprites />);
});
