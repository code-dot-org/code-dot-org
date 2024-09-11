/**
 * @file Renders the LtiLinkAccountPage component on page load.
 * This file is responsible for mounting and unmounting the React component,
 * and providing props passed down from the server to the component.
 * @see landing.html.haml.
 */
import React from 'react';
import ReactDOM from 'react-dom';

import LtiLinkAccountPage from '@cdo/apps/simpleSignUp/lti/link/LtiLinkAccountPage';
import {LtiProviderContext} from '@cdo/apps/simpleSignUp/lti/link/LtiLinkAccountPage/context';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', () => {
  const mountPoint = document.getElementById('mount-point');
  const scriptData = getScriptData('json');
  const ltiProvider = scriptData['lti_provider'];
  const ltiProviderName = scriptData['lti_provider_name'];
  const newAccountUrl = scriptData['new_account_url'];
  const existingAccountUrl = new URL(scriptData['existing_account_url']);
  const emailAddress = scriptData['email'];
  const newCtaType = scriptData['new_cta_type'];
  const continueAccountUrl = scriptData['continue_account_url'];
  const userType = scriptData['user_type'];

  const ltiProviderContext = {
    ltiProvider,
    ltiProviderName,
    newAccountUrl,
    existingAccountUrl,
    emailAddress,
    newCtaType,
    continueAccountUrl,
    userType,
  };

  ReactDOM.render(
    <LtiProviderContext.Provider value={ltiProviderContext}>
      <LtiLinkAccountPage />
    </LtiProviderContext.Provider>,
    mountPoint
  );
});
