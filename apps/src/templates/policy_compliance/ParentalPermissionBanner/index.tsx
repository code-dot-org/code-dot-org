import moment from 'moment/moment';
import PropTypes from 'prop-types';
import React, {useState, useEffect} from 'react';
import {Fade} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports
import {useSelector} from 'react-redux';

import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/utils/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/utils/AnalyticsReporter';
import {ParentalPermissionRequest} from '@cdo/apps/redux/parentalPermissionRequestReducer';
import Notification, {
  NotificationType,
} from '@cdo/apps/sharedComponents/Notification';
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
  const [showModal, setShowModal] = useState(false);
  const formattedLockoutDate = moment(lockoutDate)
    .locale(getCurrentLocale())
    .format('ll');

  const reportEvent = (eventName: string, payload: object = {}) => {
    analyticsReporter.sendEvent(eventName, payload, PLATFORMS.AMPLITUDE);
  };

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
      consentStatus: currentUser.childAccountComplianceState,
    });
  };

  const handleModalClose = (
    parentalPermissionRequest: ParentalPermissionRequest | null | undefined
  ) => {
    setShowModal(false);

    const consentStatus = parentalPermissionRequest
      ? parentalPermissionRequest.consent_status
      : currentUser.childAccountComplianceState;

    reportEvent(EVENTS.CAP_PARENT_EMAIL_MODAL_CLOSED, {
      inSection: currentUser.inSection,
      consentStatus,
    });
  };

  const handleModalSubmit = (
    parentalPermissionRequest: ParentalPermissionRequest
  ) => {
    reportEvent(EVENTS.CAP_PARENT_EMAIL_SUBMITTED, {
      inSection: currentUser.inSection,
      consentStatus: parentalPermissionRequest.consent_status,
    });
  };

  const handleModalResend = (
    parentalPermissionRequest: ParentalPermissionRequest
  ) => {
    reportEvent(EVENTS.CAP_PARENT_EMAIL_RESEND, {
      inSection: currentUser.inSection,
      consentStatus: parentalPermissionRequest.consent_status,
    });
  };

  const handleModalUpdate = (
    parentalPermissionRequest: ParentalPermissionRequest
  ) => {
    reportEvent(EVENTS.CAP_PARENT_EMAIL_UPDATED, {
      inSection: currentUser.inSection,
      consentStatus: parentalPermissionRequest.consent_status,
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
