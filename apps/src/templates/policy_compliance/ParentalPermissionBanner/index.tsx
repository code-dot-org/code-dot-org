import moment from 'moment/moment';
import PropTypes from 'prop-types';
import React, {useState, useEffect} from 'react';
import {Fade} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports
import {useSelector} from 'react-redux';

import {EVENTS, PLATFORMS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {ParentalPermissionRequest} from '@cdo/apps/redux/parentalPermissionRequestReducer';
import Notification, {NotificationType} from '@cdo/apps/templates/Notification';
import ParentalPermissionModal from '@cdo/apps/templates/policy_compliance/ParentalPermissionModal';
import {RootState} from '@cdo/apps/types/redux';
import color from '@cdo/apps/util/color';
import getCurrentLocale from '@cdo/apps/util/currentLocale';
import i18n from '@cdo/locale';

interface ParentalPermissionBannerProps {
  lockoutDate: string;
}

const ParentalPermissionBanner: React.FC<ParentalPermissionBannerProps> = ({
  lockoutDate,
}) => {
  const currentUser = useSelector((state: RootState) => state.currentUser);
  const [show, setShow] = useState(false);
  const [consentStatus, setConsentStatus] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const formattedLockoutDate = moment(lockoutDate)
    .locale(getCurrentLocale())
    .format('ll');

  const reportEvent = (eventName: string, payload: object = {}) => {
    analyticsReporter.sendEvent(eventName, payload, PLATFORMS.AMPLITUDE);
  };

  useEffect(() => {
    setConsentStatus(currentUser.childAccountComplianceState);
  }, [currentUser.childAccountComplianceState]);

  useEffect(() => {
    currentUser.userId && setShow(true);
  }, [currentUser.userId]);

  useEffect(() => {
    if (show) {
      reportEvent(EVENTS.CAP_PARENT_EMAIL_BANNER_SHOWN, {
        inSection: currentUser.inSection,
        consentStatus: currentUser.childAccountComplianceState,
      });
    }
  }, [show, currentUser.inSection, currentUser.childAccountComplianceState]);

  const handleModalShow = () => {
    setShowModal(true);

    reportEvent(EVENTS.CAP_PARENT_EMAIL_BANNER_CLICKED, {
      inSection: currentUser.inSection,
      consentStatus,
    });
  };

  const handleModalClose = (
    parentalPermissionRequest: ParentalPermissionRequest | null | undefined
  ) => {
    setShowModal(false);

    const newConsentStatus = parentalPermissionRequest
      ? parentalPermissionRequest.consent_status
      : consentStatus;

    setConsentStatus(newConsentStatus);

    reportEvent(EVENTS.CAP_PARENT_EMAIL_BANNER_CLOSED, {
      inSection: currentUser.inSection,
      consentStatus: newConsentStatus,
    });
  };

  const handleModalSubmit = (
    parentalPermissionRequest: ParentalPermissionRequest
  ) => {
    const newConsentStatus = parentalPermissionRequest.consent_status;

    setConsentStatus(newConsentStatus);

    reportEvent(EVENTS.CAP_PARENT_EMAIL_BANNER_SUBMITTED, {
      inSection: currentUser.inSection,
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

    reportEvent(EVENTS.CAP_PARENT_EMAIL_BANNER_RESEND, {
      inSection: currentUser.inSection,
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

    reportEvent(EVENTS.CAP_PARENT_EMAIL_BANNER_UPDATED, {
      inSection: currentUser.inSection,
      oldConsentStatus,
      newConsentStatus,
    });
  };

  return (
    <Fade in={show} mountOnEnter unmountOnExit>
      <div id="parental-permission-banner">
        <ParentalPermissionModal
          lockoutDate={lockoutDate}
          show={showModal}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
          onResend={handleModalResend}
          onUpdate={handleModalUpdate}
        />

        <Notification
          type={NotificationType.warning}
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
      </div>
    </Fade>
  );
};

ParentalPermissionBanner.propTypes = {
  lockoutDate: PropTypes.string.isRequired,
};

export default ParentalPermissionBanner;
