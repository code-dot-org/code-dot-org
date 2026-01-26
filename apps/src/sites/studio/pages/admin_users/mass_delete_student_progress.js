import React from 'react';
import ReactDOM from 'react-dom';

import MassDeleteContainer from '@cdo/apps/templates/admin/MassDeleteContainer';

document.addEventListener('DOMContentLoaded', function () {
  const mountPoint = document.getElementById('mass-delete-container');
  if (mountPoint) {
    ReactDOM.render(<MassDeleteContainer />, mountPoint);
  }
});
