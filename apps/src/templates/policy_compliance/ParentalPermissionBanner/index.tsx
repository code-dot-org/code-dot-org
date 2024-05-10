import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment/moment';
import {Provider} from 'react-redux';

import {getStore} from '@cdo/apps/redux';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS, PLATFORMS} from '@cdo/apps/lib/util/AnalyticsConstants';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';
import getCurrentLocale from '@cdo/apps/util/currentLocale';
import Notification from '@cdo/apps/templates/Notification';
import {ParentalPermissionRequest} from '@cdo/apps/redux/parentalPermissionRequestReducer';
import ParentalPermissionModal from '@cdo/apps/templates/policy_compliance/ParentalPermissionModal';

interface ParentalPermissionBannerProps {
  lockoutDate: string;
}

const ParentalPermissionBanner: React.FC<ParentalPermissionBannerProps> = ({
  lockoutDate,
}) => {
  const currentUser = getStore().getState().currentUser;
  const [consentStatus, setConsentStatus] = useState(
    currentUser.childAccountComplianceState
  );
  const [showModal, setShowModal] = useState(false);
  const formattedLockoutDate = moment(lockoutDate)
    .lang(getCurrentLocale())
    .format('ll');

  const reportEvent = (eventName: string, payload: object = {}) => {
    analyticsReporter.sendEvent(eventName, payload, PLATFORMS.AMPLITUDE);
  };

  useEffect(() => {
    reportEvent(EVENTS.CPA_PARENT_EMAIL_BANNER_SHOWN, {
      consentStatus: currentUser.childAccountComplianceState,
    });
  }, [currentUser]);

  const handleModalShow = () => {
    setShowModal(true);

    reportEvent(EVENTS.CPA_PARENT_EMAIL_BANNER_CLICKED, {consentStatus});
  };

  const handleModalClose = (
    parentalPermissionRequest: ParentalPermissionRequest | null | undefined
  ) => {
    setShowModal(false);

    const newConsentStatus = parentalPermissionRequest
      ? parentalPermissionRequest.consent_status
      : consentStatus;

    setConsentStatus(newConsentStatus);

    reportEvent(EVENTS.CPA_PARENT_EMAIL_BANNER_CLOSED, {
      consentStatus: newConsentStatus,
    });
  };

  const handleModalSubmit = (
    parentalPermissionRequest: ParentalPermissionRequest
  ) => {
    const newConsentStatus = parentalPermissionRequest.consent_status;

    setConsentStatus(newConsentStatus);

    reportEvent(EVENTS.CPA_PARENT_EMAIL_BANNER_SUBMITTED, {
      consentStatus: newConsentStatus,
    });
  };

  const handleModalResend = (
    prevParentalPermissionRequest: ParentalPermissionRequest,
    parentalPermissionRequest: ParentalPermissionRequest
  ) => {
    const oldConsentStatus = prevParentalPermissionRequest.consent_status;
    const newConsentStatus = parentalPermissionRequest.consent_status;

    setConsentStatus(newConsentStatus);

    reportEvent(EVENTS.CPA_PARENT_EMAIL_BANNER_RESEND, {
      oldConsentStatus,
      newConsentStatus,
    });
  };

  const handleModalUpdate = (
    prevParentalPermissionRequest: ParentalPermissionRequest,
    parentalPermissionRequest: ParentalPermissionRequest
  ) => {
    const oldConsentStatus = prevParentalPermissionRequest.consent_status;
    const newConsentStatus = parentalPermissionRequest.consent_status;

    setConsentStatus(newConsentStatus);

    reportEvent(EVENTS.CPA_PARENT_EMAIL_BANNER_UPDATED, {
      oldConsentStatus,
      newConsentStatus,
    });
  };

  return (
    <Provider store={getStore()}>
      <ParentalPermissionModal
        lockoutDate={lockoutDate}
        show={showModal}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        onResend={handleModalResend}
        onUpdate={handleModalUpdate}
      />

      <Notification
        colors={{backgroundColor: color.orange, borderColor: color.orange}}
        notice={i18n.policyCompliance_parentalPermissionBanner_title()}
        details={i18n.policyCompliance_parentalPermissionBanner_desc({
          lockoutDate: formattedLockoutDate,
        })}
        buttonText={i18n.policyCompliance_parentalPermissionBanner_button()}
        buttonLink="#"
        onButtonClick={handleModalShow}
        dismissible={false}
      />
    </Provider>
  );
};

ParentalPermissionBanner.propTypes = {
  lockoutDate: PropTypes.string.isRequired,
};

export default ParentalPermissionBanner;
