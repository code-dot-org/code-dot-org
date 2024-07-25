import React from 'react';
import ReactDOM from 'react-dom';

import NavigationSidebar from '@cdo/apps/lab2/levelEditors/NavigationSidebar';

document.addEventListener('DOMContentLoaded', () => {
  const mountPoint = document.getElementById('table-of-contents-mount-point');
  if (mountPoint) {
    ReactDOM.render(<NavigationSidebar />, mountPoint);
  }
});
