import React from 'react';
import ReactDOM from 'react-dom';
import NavigationBar from '@cdo/apps/lab2/levelEditors/NavigationBar';

document.addEventListener('DOMContentLoaded', () => {
  const mountPoint = document.getElementById('table-of-contents-mount-point');
  if (mountPoint) {
    ReactDOM.render(<NavigationBar />, mountPoint);
  }
});
