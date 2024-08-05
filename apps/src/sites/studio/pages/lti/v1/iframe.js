/**
 * @file Renders the LtiIframePage component on page load.
 * This file is responsible for mounting and unmounting the React component,
 * and providing props passed down from the server to the component.
 * @see iframe.html.haml.
 */
import React from 'react';
import {createRoot} from 'react-dom/client';

import LtiIframePage from '@cdo/apps/lib/ui/simpleSignUp/lti/iframe/LtiIframePage';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', () => {
  const mountPoint = document.createElement('div');
  document.body.appendChild(mountPoint);
  const scriptData = getScriptData('json');
  const {logoUrl, authUrl} = scriptData;

  // If running in popup, pass through to the auth url
  if (window.location === window.parent.location) {
    window.location.replace(authUrl);
    return;
  }

  const root = createRoot(mountPoint);
  root.render(<LtiIframePage logoUrl={logoUrl} authUrl={authUrl} />);
});
