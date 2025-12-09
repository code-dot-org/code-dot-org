import React from 'react';
import ReactDOM from 'react-dom';

import LinkAccountPage from '@cdo/apps/templates/gates/LinkAccountPage';

document.addEventListener('DOMContentLoaded', function () {
  ReactDOM.render(
    <LinkAccountPage />,
    document.getElementById('logged-out-page')
  );
});
