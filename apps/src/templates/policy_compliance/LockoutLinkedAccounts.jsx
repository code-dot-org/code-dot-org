import cookies from 'js-cookie';
import PropTypes from 'prop-types';
import React, {useState, useEffect, useReducer} from 'react';

import {EVENTS, PLATFORMS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import parentalPermissionRequestReducer, {
  REQUEST_PARENTAL_PERMISSION_SUCCESS,
  requestParentalPermission,
} from '@cdo/apps/redux/parentalPermissionRequestReducer';
import {isEmail} from '@cdo/apps/util/formatValidation';
import usePrevious from '@cdo/apps/util/usePrevious';
import {ChildAccountComplianceStates} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

import Spinner from '../../code-studio/pd/components/spinner';
import {getStore} from '../../redux';
import * as color from '../../util/color';
import {hashString} from '../../utils';
import Button from '../Button';

/**
 * This component allows students whose personal account linking has been
 * disabled for compliance reasons to request parent permission to unlock
 * this functionality. It is based largely on the LockoutPanel component,
 * which is similar but for students whose entire account has been locked.
 */
export default function LockoutLinkedAccounts(props) {
  const reportEvent = (eventName, payload = {}) => {
    analyticsReporter.sendEvent(eventName, payload, PLATFORMS.AMPLITUDE);
  };

  const validateEmail = email => {
    return isEmail(email) && props.userEmail !== hashString(email);
  };

  // Set the disabled state of the submit button based on the validity of the
  // email in the field.
  const [disabled, setDisabled] = useState(
    () => !validateEmail(props.pendingEmail)
  );

  // Date the last request email was sent
  const [lastEmailDate, setLastEmailDate] = useState(props.requestDate);

  // Track the state of the request as the user interacts with the form.
  const [status, setConsentStatus] = useState(props.permissionStatus);

  // State of the parent email entered by the user
  const [pendingEmail, setPendingEmail] = useState(props.pendingEmail);
  const prevPendingEmail = usePrevious(pendingEmail);

  const [
    {action, error, parentalPermissionRequest, isLoading: loading},
    parentalPermissionRequestDispatch,
  ] = useReducer(parentalPermissionRequestReducer, {isLoading: false});

  useEffect(() => {
    if (parentalPermissionRequest) {
      setPendingEmail(parentalPermissionRequest.parent_email);
      setLastEmailDate(new Date(parentalPermissionRequest.requested_at));
      setConsentStatus(parentalPermissionRequest.consent_status);
    }
  }, [parentalPermissionRequest]);

  useEffect(() => {
    reportEvent(EVENTS.CAP_SETTINGS_SHOWN, {
      providers: props.providers,
      inSection: props.inSection,
      consentStatus: props.permissionStatus,
    });
  }, [props]);

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

    if (!prevPendingEmail) {
      reportEvent(EVENTS.CAP_SETTINGS_EMAIL_SUBMITTED, {
        providers: props.providers,
        inSection: props.inSection,
        consentStatus: parentalPermissionRequest.consent_status,
      });
    } else if (parentalPermissionRequest.parent_email === prevPendingEmail) {
      reportEvent(EVENTS.CAP_SETTINGS_EMAIL_RESEND, {
        providers: props.providers,
        inSection: props.inSection,
        consentStatus: parentalPermissionRequest.consent_status,
      });
    } else {
      reportEvent(EVENTS.CAP_SETTINGS_EMAIL_UPDATED, {
        providers: props.providers,
        inSection: props.inSection,
        consentStatus: parentalPermissionRequest.consent_status,
      });
    }
  }, [action, prevPendingEmail, parentalPermissionRequest, props]);

  // When the email field is updated, also update the disability state of the
  // submit button.
  const onEmailUpdate = event => {
    setDisabled(!validateEmail(event.target.value));
  };

  // This will set the email to the current pending email and fire off the
  // form as though they had typed in the same email again.
  const resendPermissionEmail = event => {
    event.preventDefault();

    const field = document.getElementById('parent-email');
    field.value = pendingEmail;

    requestParentalPermission(parentalPermissionRequestDispatch, field.value);
  };

  // Get the current locale.
  const locale = cookies.get('language_') || 'en-US';

  // Whether or not we are rendering right-to-left.
  const isRTL = getStore().getState()?.isRtl;

  // How to format any localized dates on the page.
  const dateOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  // We want to mark the email in the prompt in bold, so we split the
  // localized string. It is a slight hack since we cannot just embed React
  // component code into a string. Should work as though we could though.
  const pendingPrompt = i18n.sessionLockoutPendingPrompt({
    pendingEmail: '{pendingEmail}',
  });
  const pendingPromptParts = pendingPrompt.split('{pendingEmail}');

  const tokenElement = document.querySelector('meta[name="csrf-token"]');
  let csrfToken = '';
  if (tokenElement) {
    csrfToken = tokenElement.attributes['content'].value;
  }

  // Child permission status from the user record
  const permissionStatus = {};
  if (error) {
    permissionStatus.message = error;
    permissionStatus.style = styles.notSubmitted;
  } else if (status === ChildAccountComplianceStates.PERMISSION_GRANTED) {
    permissionStatus.message = i18n.sessionLockoutStatusGranted();
    permissionStatus.style = styles.granted;
  } else if (pendingEmail) {
    permissionStatus.message = i18n.sessionLockoutStatusPending();
    permissionStatus.style = styles.pending;
  } else {
    permissionStatus.message = i18n.sessionLockoutStatusNotSubmitted();
    permissionStatus.style = styles.notSubmitted;
  }

  // Custom form handler to submit the permission request. The default form
  // submission does not include the Referer header, which is required for the
  // policy_compliance_controller to redirect back to the correct page.
  const submitPermissionRequest = async e => {
    e.preventDefault();
    requestParentalPermission(
      parentalPermissionRequestDispatch,
      e.target['parent-email'].value
    );
  };

  return (
    <div style={styles.container} className="lockout-linked-accounts">
      <hr />
      <h2>{i18n.lockoutManageLinkedAccountsHeader()}</h2>
      <form
        id="lockout-linked-accounts-form"
        onSubmit={submitPermissionRequest}
      >
        <p>
          {status !== ChildAccountComplianceStates.PERMISSION_GRANTED
            ? i18n.lockoutManageLinkedAccountsPrompt()
            : i18n.lockoutManageLinkedAccountsGrantedPrompt()}
        </p>
        <input type="hidden" value={csrfToken} name="authenticity_token" />
        {/* The top prompt, which depends on whether or not a request is pending. */}
        {pendingEmail &&
          status !== ChildAccountComplianceStates.PERMISSION_GRANTED && (
            <p>
              {pendingPromptParts[0]}
              <strong>{pendingEmail}</strong>
              {pendingPromptParts[1]}
            </p>
          )}

        {/* This field shows the current status of the validation. */}
        {/* Parent Permission: Not Pending / Pending */}
        <div style={styles.statusSection}>
          <div>
            <label
              style={isRTL ? styles.statusLabelRTL : styles.statusLabel}
              htmlFor="permission-status"
            >
              <strong>{i18n.childAccountConsentValidPermission()}</strong>
            </label>
            <span id="permission-status" style={permissionStatus.style}>
              <strong>{permissionStatus.message}</strong>
            </span>
          </div>

          {/* This is a floating 'link' that resends the pending email. */}
          {pendingEmail &&
            status !== ChildAccountComplianceStates.PERMISSION_GRANTED && (
              <Button
                id="lockout-resend"
                styleAsText={true}
                style={styles.resendLink}
                text={i18n.sessionLockoutResendEmail()}
                type="button"
                onClick={resendPermissionEmail}
              />
            )}
        </div>

        {/* This field allows the input of an email address. */}
        {/* Parent Email: [email] */}
        {!(status === ChildAccountComplianceStates.PERMISSION_GRANTED) && (
          <div style={styles.sections}>
            <div style={styles.section}>
              <label
                style={isRTL ? styles.labelRTL : styles.label}
                htmlFor="parent-email"
              >
                <strong>{i18n.sessionLockoutParentEmailField()}</strong>
              </label>

              {/* Slightly complicated layout allows for text underneath. */}
              <div style={styles.fieldSection}>
                <input
                  style={styles.field}
                  onChange={onEmailUpdate}
                  onInput={onEmailUpdate}
                  onBlur={onEmailUpdate}
                  defaultValue={pendingEmail}
                  name="parent-email"
                  id="parent-email"
                />

                {/* Show a 'Last email sent' prompt when available. */}
                {pendingEmail && (
                  <p style={styles.lastEmail}>
                    <em id="lockout-last-email-date">
                      {i18n.sessionLockoutLastEmailSent() + ' '}
                      {lastEmailDate.toLocaleDateString(locale, {
                        ...dateOptions,
                        hour: 'numeric',
                        minute: 'numeric',
                      })}
                    </em>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {status !== ChildAccountComplianceStates.PERMISSION_GRANTED && (
          <div style={styles.buttons}>
            {/* The submit button. */}
            {/* An empty onClick will still submit the form. */}
            {loading ? (
              <Spinner />
            ) : (
              <Button
                id="lockout-submit"
                type="submit"
                style={styles.button}
                text={
                  pendingEmail
                    ? i18n.sessionLockoutUpdateSubmit()
                    : i18n.sessionLockoutSubmit()
                }
                disabled={disabled}
                onClick={() => {}}
              />
            )}
          </div>
        )}
      </form>
    </div>
  );
}

LockoutLinkedAccounts.propTypes = {
  pendingEmail: PropTypes.string,
  requestDate: PropTypes.instanceOf(Date),
  permissionStatus: PropTypes.string,
  userEmail: PropTypes.string,
  inSection: PropTypes.bool,
  providers: PropTypes.arrayOf(PropTypes.string),
};

const styles = {
  sections: {
    marginBottom: 25,
  },
  statusSection: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 20,
  },
  section: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
  },
  notSubmitted: {
    color: color.red,
  },
  pending: {
    color: color.orange,
  },
  granted: {
    color: color.realgreen,
  },
  statusLabel: {
    display: 'inline-block',
    marginRight: 15,
  },
  statusLabelRTL: {
    display: 'inline-block',
    marginLeft: 15,
  },
  resendLink: {
    fontSize: 'inherit',
    textDecoration: 'underline',
  },
  label: {
    display: 'inline-block',
    flex: '0 0 auto',
    marginRight: 15,
    marginTop: 6,
  },
  labelRTL: {
    display: 'inline-block',
    flex: '0 0 auto',
    marginLeft: 15,
    marginTop: 6,
  },
  field: {
    color: '#292F36',
    border: '1px solid #C6CACD',
    borderRadius: 4,
    boxSizing: 'border-box',
    padding: 6,
    width: '100%',
  },
  fieldSection: {
    display: 'inline-block',
    flex: '1 0 auto',
  },
  lastEmail: {
    color: '#4D575F',
    fontSize: '85%',
    marginLeft: 5,
  },
  buttons: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    margin: 0,
    marginTop: 5,
  },
};
