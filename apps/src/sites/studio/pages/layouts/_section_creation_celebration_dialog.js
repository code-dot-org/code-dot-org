import React from 'react';
import ReactDOM from 'react-dom';
import CelebrationDialog from '@cdo/apps/templates/sectionsRefresh/CelebrationDialog';

document.addEventListener('DOMContentLoaded', () => {
  const mountPoint = document.createElement('div');
  document.body.appendChild(mountPoint);

  ReactDOM.render(<CelebrationDialog />, mountPoint);
});
