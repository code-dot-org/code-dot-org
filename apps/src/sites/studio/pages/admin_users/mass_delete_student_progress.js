import { createRoot } from "react-dom/client";
import React from 'react';
import ReactDOM from 'react-dom';

import MassDeleteContainer from '@cdo/apps/templates/admin/MassDeleteContainer';

document.addEventListener('DOMContentLoaded', function () {
  const mountPoint = document.getElementById('mass-delete-container');
  if (mountPoint) {
    const root = createRoot(mountPoint);
    root.render(<MassDeleteContainer />);
  }
});
