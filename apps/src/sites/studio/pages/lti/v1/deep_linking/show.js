/**
 * @file Renders the LtiDeepLinkingContentSelection component on page load.
 * This file is responsible for mounting and unmounting the React component,
 * and providing props passed down from the server to the component.
 * @see dashboard/app/views/lti/v1/deep_linking/show.html.haml
 */
import React from 'react';
import ReactDOM from 'react-dom';

import LtiDeepLinkingContentSelection from '@cdo/apps/lti/deepLinking';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', () => {
  const mountPoint = document.createElement('div');
  document.body.appendChild(mountPoint);
  const scriptData = getScriptData('json');
  const {deepLinkingSettings} = scriptData;

  ReactDOM.render(
    <LtiDeepLinkingContentSelection
      deepLinkingSettings={deepLinkingSettings}
    />,
    mountPoint
  );
});
