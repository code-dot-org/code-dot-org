/**
 * @file Renders the LtiUpgradeAccountDialog component on page load.
 * This file is responsible for mounting and unmounting the React component,
 * and providing props passed down from the server to the component.
 * @see upgrade_account.html.haml.
 */
import React from 'react';
import ReactDOM from 'react-dom';

import LtiUpgradeAccountDialog from '@cdo/apps/simpleSignUp/lti/upgrade/LtiUpgradeAccountDialog';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', () => {
  const scriptData = getScriptData('ltiUpgradeAccountFormData');
  const formData = scriptData['lti_upgrade_account_form_data'];

  const mountPoint = document.createElement('div');
  document.body.appendChild(mountPoint);

  const onClose = () => {
    window.location.href = formData.destination_url;
  };

  ReactDOM.render(
    <LtiUpgradeAccountDialog isOpen formData={formData} onClose={onClose} />,
    mountPoint
  );
});
