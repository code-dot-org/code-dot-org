import React, {useState, useEffect, useReducer, useMemo} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
// eslint-disable-next-line no-restricted-imports
import {
  Col,
  ControlLabel,
  FormGroup,
  FormControl,
  Modal,
  Fade,
} from 'react-bootstrap';

import {getStore} from '@cdo/apps/redux';
import usePrevious from '@cdo/apps/util/usePrevious';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS, PLATFORMS} from '@cdo/apps/lib/util/AnalyticsConstants';
import i18n from '@cdo/locale';
import currentLocale from '@cdo/apps/util/currentLocale';
import {studio} from '@cdo/apps/lib/util/urlHelpers';
import Skeleton from '@cdo/apps/util/loadingSkeleton';
import Button from '@cdo/apps/templates/Button';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import newRequestImg from '@cdo/static/common_images/penguin/yelling.png';
import updateRequestImg from '@cdo/static/common_images/penguin/dancing.png';

import parentalPermissionRequestReducer, {
  REQUEST_PARENTAL_PERMISSION_SUCCESS,
  fetchPendingPermissionRequest,
  requestParentalPermission,
} from '@cdo/apps/redux/parentalPermissionRequestReducer';

import './style.scss';

interface ParentalPermissionModalProps {
  lockoutDate: Date;
}

const ParentalPermissionModal: React.FC<ParentalPermissionModalProps> = ({
  lockoutDate,
}) => {
  const currentUser = getStore().getState().currentUser;
  const initConsentStatus = currentUser.childAccountComplianceState;
  const [show, setShow] = useState(true);
  const [requestError, setRequestError] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const formattedLockoutDate = useMemo(
    () => moment(lockoutDate).lang(currentLocale()).format('ll'),
    [lockoutDate]
  );

  const [
    {action, isLoading, error, parentalPermissionRequest},
    parentalPermissionRequestDispatch,
  ] = useReducer(parentalPermissionRequestReducer, {isLoading: false});
  const prevParentalPermissionRequest = usePrevious(parentalPermissionRequest);

  const reportEvent = (eventName: string, payload: object = {}) => {
    analyticsReporter.sendEvent(eventName, payload, PLATFORMS.AMPLITUDE);
  };

  useEffect(() => {
    setParentEmail(parentalPermissionRequest?.parent_email || '');
  }, [parentalPermissionRequest]);

  useEffect(() => {
    setRequestError(error || '');
  }, [error]);

  useEffect(() => {
    if (show) {
      fetchPendingPermissionRequest(parentalPermissionRequestDispatch);
      reportEvent(EVENTS.CPA_PARENT_EMAIL_MODAL_SHOWN, {
        consentStatus: initConsentStatus,
      });
    } else {
      reportEvent(EVENTS.CPA_PARENT_EMAIL_MODAL_CLOSED, {
        consentStatus: initConsentStatus,
      });
    }
  }, [show, initConsentStatus]);

  /**
   * This useEffect hook is responsible for reporting successful parent permission request events:
   *
   * Submission event if a previous permission request does not exist.
   * Resend event if a previous permission request exists and the parent email has not changed.
   * Update event if a previous permission request exists and the parent email has changed.
   */
  useEffect(() => {
    if (action !== REQUEST_PARENTAL_PERMISSION_SUCCESS) return;
    if (!parentalPermissionRequest) return;

    const eventPayload = {
      consentStatusBefore:
        prevParentalPermissionRequest?.consent_status || initConsentStatus,
      consentStatusAfter: parentalPermissionRequest.consent_status,
    };

    if (!prevParentalPermissionRequest) {
      reportEvent(EVENTS.CPA_PARENT_EMAIL_MODAL_SUBMITTED, eventPayload);
    } else if (
      prevParentalPermissionRequest.parent_email ===
      parentalPermissionRequest.parent_email
    ) {
      reportEvent(EVENTS.CPA_PARENT_EMAIL_MODAL_RESEND, eventPayload);
    } else {
      reportEvent(EVENTS.CPA_PARENT_EMAIL_MODAL_UPDATED, eventPayload);
    }
  }, [
    action,
    initConsentStatus,
    prevParentalPermissionRequest,
    parentalPermissionRequest,
  ]);

  const handleParentEmailChange: React.FormEventHandler<
    FormControl
  > = event => {
    requestError && setRequestError('');
    setParentEmail((event.target as HTMLInputElement).value);
  };

  const requestPermission = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    requestParentalPermission(parentalPermissionRequestDispatch, parentEmail);
  };

  const permissionRequestStatusBlock = () => {
    let status;

    if (isLoading) {
      status = <Skeleton />;
    } else if (requestError) {
      status = <span className="status error">{requestError}</span>;
    } else if (parentalPermissionRequest) {
      status = (
        <span className="status pending">
          {i18n.sessionLockoutStatusPending()}
        </span>
      );
    } else {
      status = (
        <span className="status not-submitted">
          {i18n.sessionLockoutStatusNotSubmitted()}
        </span>
      );
    }

    return (
      <FormGroup
        id="parental-permission-request-status"
        className="row"
        bsSize="large"
      >
        <Col xs={4}>
          <ControlLabel className="title">
            {i18n.sessionLockoutParentStatusField()}
          </ControlLabel>
        </Col>

        <Col xs={8}>
          <FormControl.Static>{status}</FormControl.Static>
        </Col>
      </FormGroup>
    );
  };

  const lastEmailSentAtLabel = () => {
    if (!parentalPermissionRequest?.requested_at) return;

    const lastEmailSentAt = isLoading ? (
      <Skeleton />
    ) : (
      i18n.policyCompliance_parentalPermissionModal_lastEmailSentAt({
        sendingTime: moment(parentalPermissionRequest.requested_at)
          .lang(currentLocale())
          .format('lll'),
      })
    );

    return <span id="last-email-sent-at">{lastEmailSentAt}</span>;
  };

  const parentEmailField = () => {
    return (
      <FormGroup
        id="parental-permission-request-email"
        className="row"
        bsSize="large"
      >
        <Col xs={4}>
          <ControlLabel htmlFor="parentEmail">
            {i18n.sessionLockoutParentEmailField()}
          </ControlLabel>
        </Col>

        <Col xs={8}>
          <FormControl
            id="parentEmail"
            type="email"
            value={parentEmail}
            onChange={handleParentEmailChange}
            required
          />

          {lastEmailSentAtLabel()}
        </Col>
      </FormGroup>
    );
  };

  const submitButton = (text: string) => {
    return (
      <Button
        className="primary"
        type="submit"
        text={text}
        pendingText={text}
        isPending={isLoading}
        disabled={!!requestError}
        onClick={() => {}}
      />
    );
  };

  const newPermissionRequestForm = () => {
    return (
      <form onSubmit={requestPermission}>
        <Modal.Header
          closeButton
          closeLabel={i18n.closeDialog()}
          onHide={() => setShow(false)}
        >
          <img src={newRequestImg} alt="" aria-hidden="true" />

          <Modal.Title componentClass="h2" id="parental-permission-modal-title">
            {i18n.policyCompliance_parentalPermissionModal_newRequestForm_title()}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <SafeMarkdown
            markdown={i18n.policyCompliance_parentalPermissionModal_newRequestForm_text1(
              {lockoutDate: formattedLockoutDate}
            )}
          />

          <p>
            {i18n.policyCompliance_parentalPermissionModal_newRequestForm_text2()}
          </p>

          <div id="parental-permission-request">
            {permissionRequestStatusBlock()}

            {parentEmailField()}
          </div>
        </Modal.Body>

        <Modal.Footer>{submitButton(i18n.sessionLockoutSubmit())}</Modal.Footer>
      </form>
    );
  };

  const updatePermissionRequestForm = () => {
    const isResend =
      parentEmail.toLowerCase() ===
      parentalPermissionRequest?.parent_email?.toLowerCase();
    const submitText = isResend
      ? i18n.sessionLockoutResendEmail()
      : i18n.sessionLockoutUpdateSubmit();

    return (
      <form onSubmit={requestPermission}>
        <Modal.Header
          closeButton
          closeLabel={i18n.closeDialog()}
          onHide={() => setShow(false)}
        >
          <img src={updateRequestImg} alt="" aria-hidden="true" />

          <Modal.Title componentClass="h2" id="parental-permission-modal-title">
            {i18n.policyCompliance_parentalPermissionModal_updateRequestForm_title()}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>
            {i18n.policyCompliance_parentalPermissionModal_updateRequestForm_text1(
              {lockoutDate: formattedLockoutDate}
            )}
          </p>

          <div id="parental-permission-request">
            {permissionRequestStatusBlock()}

            {parentEmailField()}

            <SafeMarkdown
              markdown={i18n.policyCompliance_parentalPermissionModal_updateRequestForm_text2(
                {profileUrl: studio('/users/edit')}
              )}
            />
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button
            className="secondary"
            type="button"
            text={i18n.closeDialog()}
            color={Button.ButtonColor.gray}
            onClick={() => setShow(false)}
          />

          {submitButton(submitText)}
        </Modal.Footer>
      </form>
    );
  };

  const permissionRequestForm = () => {
    if (parentalPermissionRequest === undefined && isLoading) {
      return <Skeleton height={500} />;
    } else if (parentalPermissionRequest) {
      return updatePermissionRequestForm();
    } else {
      return newPermissionRequestForm();
    }
  };

  return (
    <>
      <Fade in={show} mountOnEnter unmountOnExit>
        <div className="modal-backdrop" />
      </Fade>

      <Fade in={show} mountOnEnter unmountOnExit>
        <Modal.Dialog
          id="parental-permission-modal"
          aria-labelledby="parental-permission-modal-title"
        >
          {permissionRequestForm()}
        </Modal.Dialog>
      </Fade>
    </>
  );
};

ParentalPermissionModal.propTypes = {
  lockoutDate: PropTypes.instanceOf(Date).isRequired,
};

export default ParentalPermissionModal;
