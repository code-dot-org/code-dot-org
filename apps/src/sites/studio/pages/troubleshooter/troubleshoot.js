/**
 * @file Renders the LtiUpgradeAccountDialog component on page load.
 * This file is responsible for mounting and unmounting the React component,
 * and providing props passed down from the server to the component.
 * @see upgrade_account.html.haml.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import TroubleshooterPage from '@cdo/apps/troubleshooter/TroubleshooterPage';

document.addEventListener('DOMContentLoaded', () => {
  const mountPoint = document.getElementById('troubleshooter');

  ReactDOM.render(<TroubleshooterPage />, mountPoint);
});
