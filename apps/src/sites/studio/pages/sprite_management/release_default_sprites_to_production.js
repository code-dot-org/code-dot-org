import { createRoot } from "react-dom/client";
import React from 'react';
import ReactDOM from 'react-dom';

import ReleaseDefaultSprites from '@cdo/apps/code-studio/assets/ReleaseDefaultSprites';

$(document).ready(function () {
  const root = createRoot(document.getElementById('release-default-sprites-to-production-container'));
  root.render(<ReleaseDefaultSprites />);
});
