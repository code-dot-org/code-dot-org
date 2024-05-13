import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import {tryGetLocalStorage, trySetLocalStorage} from '@cdo/apps/utils';
import getScriptData from '@cdo/apps/util/getScriptData';
import ParentalPermissionModal from '@cdo/apps/templates/policy_compliance/ParentalPermissionModal';

const SHOW_DELAY = 86400; // 1 day

document.addEventListener('DOMContentLoaded', () => {
  const renderModal = () => {
    const lockoutDate = new Date(getScriptData('lockoutDate'));

    return ReactDOM.render(
      <ParentalPermissionModal lockoutDate={lockoutDate} />,
      document.getElementById('parental-permission-modal-container')
    );
  };

  if (getScriptData('forceDisplay')) {
    renderModal();
  } else {
    const studentUuid = getScriptData('studentUuid');
    const modalKey = `cap-ppm-last-shown-at-${studentUuid}`;
    const lastShownAt = moment(tryGetLocalStorage(modalKey, ''));

    // If the modal has been shown in the last 24 hours, don't show it again.
    if (moment().diff(lastShownAt, 'seconds') < SHOW_DELAY) return;

    renderModal();

    // Records the time the modal was last shown.
    trySetLocalStorage(modalKey, moment().toISOString());
  }
});
