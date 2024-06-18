/**
 * @file Renders the LtiLinkAccountPage component on page load.
 * This file is responsible for mounting and unmounting the React component,
 * and providing props passed down from the server to the component.
 * @see landing.html.haml.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import LtiLinkAccountPage from '@cdo/apps/lib/ui/lti/link/LtiLinkAccountPage';
import getScriptData from '@cdo/apps/util/getScriptData';
import {LtiProviderContext} from '@cdo/apps/lib/ui/lti/link/LtiLinkAccountPage/context';

document.addEventListener('DOMContentLoaded', () => {
  const mountPoint = document.getElementById('mount-point');
  const scriptData = getScriptData('json');
  const ltiProvider = scriptData['lti_provider'];
  const ltiProviderName = scriptData['lti_provider_name'];
  const newAccountUrl = scriptData['new_account_url'];
  const existingAccountUrl = new URL(scriptData['existing_account_url']);
  const emailAddress = scriptData['email'];

  const ltiProviderContext = {
    ltiProvider,
    ltiProviderName,
    newAccountUrl,
    existingAccountUrl,
    emailAddress,
  };

  ReactDOM.render(
    <LtiProviderContext.Provider value={ltiProviderContext}>
      <LtiLinkAccountPage />
    </LtiProviderContext.Provider>,
    mountPoint
  );
});
