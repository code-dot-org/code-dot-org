import cookies from 'js-cookie';
import React, {CSSProperties, useState, useEffect, useReducer} from 'react';
import {useSelector} from 'react-redux';

import Button from '@cdo/apps/legacySharedComponents/Button';
import {EVENTS, PLATFORMS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import parentalPermissionRequestReducer, {
  REQUEST_PARENTAL_PERMISSION_SUCCESS,
  requestParentalPermission,
} from '@cdo/apps/redux/parentalPermissionRequestReducer';
import {RootState} from '@cdo/apps/types/redux';
import {isEmail} from '@cdo/apps/util/formatValidation';
import usePrevious from '@cdo/apps/util/usePrevious';
import {ChildAccountComplianceStates} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';
import headerThanksImage from '@cdo/static/common_images/penguin/dancing.png';
import headerImage from '@cdo/static/common_images/penguin/yelling.png';

import {getStore} from '../../redux';
import Spinner from '../../sharedComponents/Spinner';
import * as color from '../../util/color';
import {hashString} from '../../utils';

/**
 * This panel represents the page that is displayed to accounts that are being
 * locked from accessing certain parts of the site until they get parental
 * permission. This panel gives a form to request (or see details about a
 * pending request for) parental permission.
 */
const LockoutPanel: React.FC<LockoutPanelProps> = props => {
  const reportEvent = (eventName: string, payload: object = {}) => {
    analyticsReporter.sendEvent(eventName, payload, PLATFORMS.AMPLITUDE);
  };

  // Determine if we think the given email matches the child email
  const isEmailDisallowed = (email: string) => {
    return props.disallowedEmail === hashString(email);
  };

  // Determine if the email is allowed
  const validateEmail = (email?: string) => {
    if (!email) {
      return false;
    }
    return isEmail(email) && !isEmailDisallowed(email);
  };

  // Set the disabled state of the submit button based on the validity of the
  // email in the field.
  const [disabled, setDisabled] = useState(() => !validateEmail(pendingEmail));

  // When the email field is updated, also update the disability state of the
  // submit button.
  const onEmailUpdate = (event: React.FormEvent<HTMLInputElement>) => {
    const parentEmailInput = (event.target as HTMLInputElement).value;
    setDisabled(!validateEmail(parentEmailInput));
    setParentEmail(parentEmailInput);
  };

  // Date the last request email was sent
  const [lastEmailDate, setLastEmailDate] = useState(props.requestDate);

  // Track the state of the request as the user interacts with the form.
  const [status, setConsentStatus] = useState(props.permissionStatus);

  // State of the parent email entered by the user
  const [pendingEmail, setPendingEmail] = useState(props.pendingEmail);
  const prevPendingEmail = usePrevious(pendingEmail);

  const [parentEmail, setParentEmail] = useState(props.pendingEmail);
  const currentUser = useSelector((state: RootState) => state.currentUser);

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
    if (currentUser?.userId) {
      reportEvent(EVENTS.CAP_LOCKOUT_SHOWN, {
        inSection: props.inSection,
        consentStatus: props.permissionStatus,
        requestSent: !!props.pendingEmail,
      });
    }
  }, [
    props.inSection,
    props.permissionStatus,
    props.pendingEmail,
    currentUser.userId,
  ]);

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
      reportEvent(EVENTS.CAP_LOCKOUT_EMAIL_SUBMITTED, {
        inSection: props.inSection,
        consentStatus: parentalPermissionRequest.consent_status,
      });
    } else if (parentalPermissionRequest.parent_email === prevPendingEmail) {
      reportEvent(EVENTS.CAP_LOCKOUT_EMAIL_RESEND, {
        inSection: props.inSection,
        consentStatus: parentalPermissionRequest.consent_status,
      });
    } else {
      reportEvent(EVENTS.CAP_LOCKOUT_EMAIL_UPDATED, {
        inSection: props.inSection,
        consentStatus: parentalPermissionRequest.consent_status,
      });
    }
  }, [action, prevPendingEmail, parentalPermissionRequest, props.inSection]);

  // This will set the email to the current pending email and fire off the
  // form as though they had typed in the same email again.
  const resendPermissionEmail = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();

    if (pendingEmail) {
      requestParentalPermission(
        parentalPermissionRequestDispatch,
        pendingEmail
      );
    }
  };

  // Custom form handler to submit the permission request. The default form
  // submission does not include the Referer header, which is required for the
  // policy_compliance_controller to redirect back to the correct page.
  const submitPermissionRequest = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (parentEmail) {
      requestParentalPermission(parentalPermissionRequestDispatch, parentEmail);
    }
  };

  const signOut = (event: React.MouseEvent<HTMLButtonElement>) => {
    window.location.href = 'users/sign_out';
    reportEvent(EVENTS.CAP_LOCKOUT_SIGN_OUT, {
      inSection: props.inSection,
      consentStatus: status,
    });
  };

  // Get the current locale.
  const locale = cookies.get('language_') || 'en-US';

  // Whether or not we are rendering right-to-left.
  const isRTL = getStore().getState()?.isRtl;

  // How to format any localized dates on the page.
  const dateOptions: Intl.DateTimeFormatOptions = {
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

  // Child permission status from the user record
  const permissionStatus: {message: string; style: CSSProperties} = {
    message: i18n.sessionLockoutStatusNotSubmitted(),
    style: styles.notSubmitted,
  };
  if (error) {
    permissionStatus.message = error;
    permissionStatus.style = styles.notSubmitted;
  } else if (status === ChildAccountComplianceStates.PERMISSION_GRANTED) {
    permissionStatus.message = i18n.sessionLockoutStatusGranted();
    permissionStatus.style = styles.granted;
  } else if (pendingEmail) {
    permissionStatus.message = i18n.sessionLockoutStatusPending();
    permissionStatus.style = styles.pending;
  }

  return (
    <div style={styles.container} className="lockout-panel">
      {/* Header image: Depends of if permission request is sent. */}
      <img
        style={styles.image}
        src={pendingEmail ? headerThanksImage : headerImage}
        alt={
          pendingEmail
            ? i18n.sessionLockoutHeaderThanksDescription()
            : i18n.sessionLockoutHeaderDescription()
        }
      />

      <h2>
        {pendingEmail
          ? i18n.sessionLockoutPendingHeader()
          : status === ChildAccountComplianceStates.GRACE_PERIOD
          ? i18n.sessionLockoutNewPreLockoutAccountHeader()
          : i18n.sessionLockoutNewAccountHeader()}
      </h2>

      {/* This form will post a permission request for the student.*/}
      <form
        id="lockout-panel-form"
        action={props.apiURL}
        method="post"
        onSubmit={submitPermissionRequest}
      >
        {/* The top prompt, which depends on whether or not a request is pending. */}
        {pendingEmail && (
          <p>
            {pendingPromptParts[0]}
            <strong>{pendingEmail}</strong>
            {pendingPromptParts[1]}
          </p>
        )}
        {!pendingEmail && (
          <p>
            {status === ChildAccountComplianceStates.GRACE_PERIOD
              ? i18n.sessionLockoutPreLockoutAccountPrompt()
              : i18n.sessionLockoutPrompt()}
          </p>
        )}

        {/* The timezone is set to UTC to ensure that the exact date renders. */}
        <p>
          {i18n.sessionLockoutNote({
            deleteDate: props.deleteDate.toLocaleDateString(locale, {
              ...dateOptions,
              timeZone: 'UTC',
            }),
          })}
        </p>

        {/* This field shows the current status of the validation. */}
        {/* Parent Permission: Not Pending / Pending */}
        <div style={styles.statusSection}>
          <div>
            <label
              style={isRTL ? styles.statusLabelRTL : styles.statusLabel}
              htmlFor="permission-status"
            >
              <strong>{i18n.sessionLockoutParentStatusField()}</strong>
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
        {status !== ChildAccountComplianceStates.PERMISSION_GRANTED && (
          <div>
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
                    defaultValue={parentEmail}
                    name="parent-email"
                    id="parent-email"
                  />

                  {/* Show a 'Last email sent' prompt when available. */}
                  {pendingEmail && lastEmailDate && (
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
            <div style={styles.buttons}>
              {/* A sign-out button. */}
              <Button
                id="lockout-signout"
                type="button"
                style={styles.button}
                text={i18n.signOutButton()}
                color={Button.ButtonColor.gray}
                onClick={signOut}
              />

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
          </div>
        )}
      </form>
    </div>
  );
};

const styles: {[key: string]: CSSProperties} = {
  container: {
    border: '1px solid rgb(233 233 233)',
    boxShadow: '5px 5px 3px 0px #ccc',
    boxSizing: 'border-box',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 10,
    maxWidth: 700,
    padding: 20,
    paddingBottom: 0,
  },
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
  image: {
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
    width: 116,
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

export interface LockoutPanelProps {
  apiURL: string;
  deleteDate: Date;
  pendingEmail?: string;
  requestDate?: Date;
  disallowedEmail: string;
  permissionStatus: string;
  inSection: boolean;
}

export default LockoutPanel;
