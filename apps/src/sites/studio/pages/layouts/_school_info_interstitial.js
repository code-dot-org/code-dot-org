/**
 * @file Renders the SchoolInfoInterstitial component on page load.
 * This file is responsibile for mounting and unmounting the React component,
 * and providing props passed down from the server to the component.
 * @see _school_info_interstitial.html.haml.
 */
import React from 'react';
import ReactDOM from 'react-dom';

import SchoolInfoInterstitial from '@cdo/apps/lib/ui/SchoolInfoInterstitial';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', () => {
  const scriptData = getScriptData('schoolinfointerstitial');

  const mountPoint = document.createElement('div');
  document.body.appendChild(mountPoint);

  function unmount() {
    ReactDOM.unmountComponentAtNode(mountPoint);
    document.body.removeChild(mountPoint);
  }

  ReactDOM.render(
    <SchoolInfoInterstitial scriptData={scriptData} onClose={unmount} />,
    mountPoint
  );
});
