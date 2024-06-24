import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';

import {tryGetLocalStorage, trySetLocalStorage} from '@cdo/apps/utils';
import getScriptData from '@cdo/apps/util/getScriptData';
import ParentalPermissionModal from '@cdo/apps/templates/policy_compliance/ParentalPermissionModal';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS, PLATFORMS} from '@cdo/apps/lib/util/AnalyticsConstants';

const SHOW_DELAY = 86400; // 1 day

document.addEventListener('DOMContentLoaded', () => {
  const renderModal = () => {
    const inSection = getScriptData('inSection');

    const reportEvent = (eventName, payload = {}) => {
      payload.inSection = inSection;
      analyticsReporter.sendEvent(eventName, payload, PLATFORMS.AMPLITUDE);
    };

    const handleClose = () => {
      reportEvent(EVENTS.CAP_PARENT_EMAIL_MODAL_CLOSED);
    };

    const handleSubmit = parentalPermissionRequest => {
      reportEvent(EVENTS.CAP_PARENT_EMAIL_SUBMITTED, {
        consentStatus: parentalPermissionRequest.consent_status,
      });
    };

    const handleResend = (prevPPR, PPR) => {
      reportEvent(EVENTS.CAP_PARENT_EMAIL_RESEND, {
        oldConsentStatus: prevPPR.consent_status,
        newConsentStatus: PPR.consent_status,
      });
    };

    const handleUpdate = (prevPPR, PPR) => {
      reportEvent(EVENTS.CAP_PARENT_EMAIL_UPDATED, {
        oldConsentStatus: prevPPR.consent_status,
        newConsentStatus: PPR.consent_status,
      });
    };

    ReactDOM.render(
      <ParentalPermissionModal
        lockoutDate={getScriptData('lockoutDate')}
        onClose={handleClose}
        onSubmit={handleSubmit}
        onResend={handleResend}
        onUpdate={handleUpdate}
      />,
      document.getElementById('parental-permission-modal-container')
    );

    reportEvent(EVENTS.CAP_PARENT_EMAIL_MODAL_SHOWN);
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
