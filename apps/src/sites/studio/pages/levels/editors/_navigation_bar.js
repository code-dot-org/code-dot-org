import React from 'react';
import ReactDOM from 'react-dom';
import NavigationBar from '@cdo/apps/lab2/levelEditors/NavigationBar';

document.addEventListener('DOMContentLoaded', () => {
  const mountPoint = document.getElementById('table-of-contents-mount-point');
  console.log('inside _navigation_bar.js');
  if (mountPoint) {
    ReactDOM.render(<NavigationBar />, mountPoint);
  }
});
console.log('outside _navigation_bar.js');
