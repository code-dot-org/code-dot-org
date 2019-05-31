/**
 * @file Renders the SchoolInfoConfirmationDialog component on page load.
 * This file is responsibile for mounting and unmounting the React component,
 * and providing props passed down from the server to the component.
 * @see _school_info_confirmation_dialog.html.haml.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import SchoolInfoConfirmationDialog from '@cdo/apps/lib/ui/SchoolInfoConfirmationDialog';
import getScriptData from '@cdo/apps/util/getScriptData';
import experiments from '@cdo/apps/util/experiments';

document.addEventListener('DOMContentLoaded', () => {
  const scriptData = getScriptData('schoolinfoconfirmationdialog');

  const mountPoint = document.createElement('div');
  document.body.appendChild(mountPoint);

  function unmount() {
    ReactDOM.unmountComponentAtNode(mountPoint);
    document.body.removeChild(mountPoint);
  }

  if (experiments.isEnabled(experiments.SCHOOL_INFO_CONFIRMATION_DIALOG)) {
    ReactDOM.render(
      <SchoolInfoConfirmationDialog
        scriptData={scriptData}
        onClose={unmount}
      />,
      mountPoint
    );
  }
});
