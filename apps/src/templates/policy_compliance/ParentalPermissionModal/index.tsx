import moment from 'moment';
import PropTypes from 'prop-types';
import React, {useState, useEffect, useReducer} from 'react';
// eslint-disable-next-line no-restricted-imports
import {
  Col,
  ControlLabel,
  FormGroup,
  FormControl,
  Modal,
  Fade,
} from 'react-bootstrap';

import Button from '@cdo/apps/legacySharedComponents/Button';
import {studio} from '@cdo/apps/lib/util/urlHelpers';
import parentalPermissionRequestReducer, {
  REQUEST_PARENTAL_PERMISSION_SUCCESS,
  ParentalPermissionRequest,
  fetchPendingPermissionRequest,
  requestParentalPermission,
  resetParentalPermissionRequest,
} from '@cdo/apps/redux/parentalPermissionRequestReducer';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import currentLocale from '@cdo/apps/util/currentLocale';
import Skeleton from '@cdo/apps/util/loadingSkeleton';
import usePrevious from '@cdo/apps/util/usePrevious';
import i18n from '@cdo/locale';
import updateRequestImg from '@cdo/static/common_images/penguin/dancing.png';
import newRequestImg from '@cdo/static/common_images/penguin/yelling.png';

import './style.scss';

interface ParentalPermissionModalProps {
  lockoutDate: string;
  show?: boolean;
  onClose?: (
    parentalPermissionRequest: ParentalPermissionRequest | null | undefined
  ) => void;
  onSubmit?: (parentalPermissionRequest: ParentalPermissionRequest) => void;
  onResend?: (parentalPermissionRequest: ParentalPermissionRequest) => void;
  onUpdate?: (parentalPermissionRequest: ParentalPermissionRequest) => void;
}

const ParentalPermissionModal: React.FC<ParentalPermissionModalProps> = ({
  lockoutDate,
  show = true,
  onClose = () => {},
  onSubmit = () => {},
  onResend = () => {},
  onUpdate = () => {},
}) => {
  const [shown, setShown] = useState(show);
  const [requestError, setRequestError] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const formattedLockoutDate = moment(lockoutDate)
    .locale(currentLocale())
    .format('ll');

  const [
    {action, isLoading, error, parentalPermissionRequest},
    parentalPermissionRequestDispatch,
  ] = useReducer(parentalPermissionRequestReducer, {isLoading: false});
  const prevParentalPermissionRequest = usePrevious(parentalPermissionRequest);

  useEffect(() => {
    setShown(show);
  }, [show]);

  useEffect(() => {
    shown && fetchPendingPermissionRequest(parentalPermissionRequestDispatch);
  }, [shown]);

  useEffect(() => {
    setParentEmail(parentalPermissionRequest?.parent_email || '');
  }, [parentalPermissionRequest]);

  useEffect(() => {
    setRequestError(error || '');
  }, [error]);

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

    if (!prevParentalPermissionRequest) {
      onSubmit(parentalPermissionRequest);
    } else if (
      prevParentalPermissionRequest.parent_email ===
      parentalPermissionRequest.parent_email
    ) {
      onResend(parentalPermissionRequest);
    } else {
      onUpdate(parentalPermissionRequest);
    }
  }, [
    action,
    prevParentalPermissionRequest,
    parentalPermissionRequest,
    onSubmit,
    onResend,
    onUpdate,
  ]);

  const close = () => {
    onClose(parentalPermissionRequest);
    resetParentalPermissionRequest(parentalPermissionRequestDispatch);
    setShown(false);
  };

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
          .locale(currentLocale())
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
          onHide={close}
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
          onHide={close}
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
            onClick={close}
          />

          {submitButton(submitText)}
        </Modal.Footer>
      </form>
    );
  };

  const permissionRequestForm = () => {
    if (parentalPermissionRequest === undefined) {
      return <Skeleton height={500} />;
    } else if (parentalPermissionRequest) {
      return updatePermissionRequestForm();
    } else {
      return newPermissionRequestForm();
    }
  };

  return (
    <>
      <Fade in={shown} mountOnEnter unmountOnExit>
        <div className="modal-backdrop" />
      </Fade>

      <Fade in={shown} mountOnEnter unmountOnExit>
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
  lockoutDate: PropTypes.string.isRequired,
  show: PropTypes.bool,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  onResend: PropTypes.func,
  onUpdate: PropTypes.func,
};

export default ParentalPermissionModal;
