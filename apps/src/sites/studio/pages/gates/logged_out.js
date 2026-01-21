import { createRoot } from "react-dom/client";
import React from 'react';
import ReactDOM from 'react-dom';

import LinkAccountPage from '@cdo/apps/templates/gates/LinkAccountPage';

document.addEventListener('DOMContentLoaded', function () {
  const root = createRoot(document.getElementById('logged-out-page'));
  root.render(<LinkAccountPage />);
});
