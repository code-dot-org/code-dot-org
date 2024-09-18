/**
 * @file Renders the LtiDynamicRegistrationPage component on page load.
 * This file is responsible for mounting and unmounting the React component,
 * and providing props passed down from the server to the component.
 * @see dynamic_registration.html.haml.
 */
import React from 'react';
import ReactDOM from 'react-dom';

import LtiDynamicRegistrationPage from '@cdo/apps/simpleSignUp/lti/registration/LtiDynamicRegistrationPage';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', () => {
  const mountPoint = document.createElement('div');
  document.body.appendChild(mountPoint);
  const scriptData = getScriptData('json');
  const {logoUrl, registrationID} = scriptData;

  ReactDOM.render(
    <LtiDynamicRegistrationPage
      logoUrl={logoUrl}
      registrationID={registrationID}
    />,
    mountPoint
  );
});
