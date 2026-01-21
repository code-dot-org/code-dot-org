import { createRoot } from "react-dom/client";
import React from 'react';
import ReactDOM from 'react-dom';

import SpriteManagementDirectory from '@cdo/apps/code-studio/assets/SpriteManagementDirectory';

$(document).ready(function () {
  const root = createRoot(document.getElementById('sprite-management-directory-container'));
  root.render(<SpriteManagementDirectory />);
});
