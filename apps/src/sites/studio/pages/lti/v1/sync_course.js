/**
 * @file Renders the LtiSectionSyncDialog component on page load.
 * This file is responsible for mounting and unmounting the React component,
 * and providing props passed down from the server to the component.
 * @see sync_course.html.haml.
 */
import React from 'react';
import ReactDOM from 'react-dom';

import LtiSectionSyncDialog from '@cdo/apps/lib/ui/simpleSignUp/lti/sync/LtiSectionSyncDialog';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', () => {
  const scriptData = getScriptData('ltiSectionSyncDialog');

  const mountPoint = document.createElement('div');
  document.body.appendChild(mountPoint);

  const onClose = () => {
    window.location.href = '/home';
  };

  const result = scriptData['lti_section_sync_result'];
  const lmsName = scriptData['lms_name'];

  ReactDOM.render(
    <LtiSectionSyncDialog
      isOpen
      syncResult={result}
      onClose={onClose}
      disableRosterSyncButtonEnabled
      lmsName={lmsName}
    />,
    mountPoint
  );
});
