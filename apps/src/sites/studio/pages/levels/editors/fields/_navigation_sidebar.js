import React from 'react';
import {createRoot} from 'react-dom/client';

import NavigationSidebar from '@cdo/apps/lab2/levelEditors/NavigationSidebar';

document.addEventListener('DOMContentLoaded', () => {
  const mountPoint = document.getElementById('table-of-contents-mount-point');
  if (mountPoint) {
    const root = createRoot(mountPoint);
    root.render(<NavigationSidebar />);
  }
});
