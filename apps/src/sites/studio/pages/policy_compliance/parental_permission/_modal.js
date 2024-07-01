import React from 'react';
import {Provider, useSelector} from 'react-redux';
import ReactDOM from 'react-dom';
import moment from 'moment';

import {getStore} from '@cdo/apps/redux';
import {tryGetLocalStorage, trySetLocalStorage} from '@cdo/apps/utils';
import getScriptData from '@cdo/apps/util/getScriptData';
import ParentalPermissionModal from '@cdo/apps/templates/policy_compliance/ParentalPermissionModal';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS, PLATFORMS} from '@cdo/apps/lib/util/AnalyticsConstants';

const SHOW_DELAY = 86400; // 1 day

document.addEventListener('DOMContentLoaded', () => {
  const renderModal = () => {
    // eslint-disable-next-line react/prop-types
    const Modal = ({lockoutDate, inSection}) => {
      const reportEvent = (eventName, payload = {}) => {
        payload.inSection = inSection;
        analyticsReporter.sendEvent(eventName, payload, PLATFORMS.AMPLITUDE);
      };

      const handleClose = parentalPermissionRequest => {
        reportEvent(EVENTS.CAP_PARENT_EMAIL_MODAL_CLOSED, {
          consentStatus: parentalPermissionRequest?.consent_status,
        });
      };

      const handleSubmit = parentalPermissionRequest => {
        reportEvent(EVENTS.CAP_PARENT_EMAIL_SUBMITTED, {
          consentStatus: parentalPermissionRequest.consent_status,
        });
      };

      const handleResend = parentalPermissionRequest => {
        reportEvent(EVENTS.CAP_PARENT_EMAIL_RESEND, {
          consentStatus: parentalPermissionRequest.consent_status,
        });
      };

      const handleUpdate = parentalPermissionRequest => {
        reportEvent(EVENTS.CAP_PARENT_EMAIL_UPDATED, {
          consentStatus: parentalPermissionRequest.consent_status,
        });
      };

      const currentUser = useSelector(state => state.currentUser);
      if (!currentUser?.userId) return null;

      reportEvent(EVENTS.CAP_PARENT_EMAIL_MODAL_SHOWN, {
        consentStatus: currentUser?.childAccountComplianceState,
      });

      return (
        <ParentalPermissionModal
          lockoutDate={lockoutDate}
          onClose={handleClose}
          onSubmit={handleSubmit}
          onResend={handleResend}
          onUpdate={handleUpdate}
        />
      );
    };

    ReactDOM.render(
      <Provider store={getStore()}>
        <Modal
          lockoutDate={getScriptData('lockoutDate')}
          inSection={getScriptData('inSection')}
        />
      </Provider>,
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
