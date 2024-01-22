import React, {useState} from 'react';
import PropTypes from 'prop-types';
import Button from '../Button';
import i18n from '@cdo/locale';
import {getStore} from '../../redux';
import {isEmail} from '@cdo/apps/util/formatValidation';
import cookies from 'js-cookie';
import * as color from '../../util/color';
import {hashString} from '../../utils';
import {ChildAccountComplianceStates} from '@cdo/apps/util/sharedConstants';
import Spinner from '../../code-studio/pd/components/spinner';

/**
 * This component allows students whose personal account linking has been
 * disabled for compliance reasons to request parent permission to unlock
 * this functionality. It is based largely on the LockoutPanel component,
 * which is similar but for students whose entire account has been locked.
 */
export default function LockoutLinkedAccounts(props) {
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

  // Loading state for the submit button, for use when the request is sending on the backend.
  const [loading, setLoading] = useState(false);

  // Track the state of the request as the user interacts with the form.
  const [status, setStatus] = useState(props.permissionStatus);

  // State of the parent email entered by the user
  const [pendingEmail, setPendingEmail] = useState(props.pendingEmail);

  // When the email field is updated, also update the disability state of the
  // submit button.
  const onEmailUpdate = event => {
    setDisabled(!validateEmail(event.target.value));
  };

  // This will set the email to the current pending email and fire off the
  // form as though they had typed in the same email again.
  const resendPermissionEmail = event => {
    const field = document.getElementById('parent-email');
    field.value = pendingEmail;

    const form = document.getElementById('lockout-linked-accounts-form');
    form.submit();
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
  switch (status) {
    case ChildAccountComplianceStates.REQUEST_SENT:
      permissionStatus.message = i18n.sessionLockoutStatusPending();
      permissionStatus.style = styles.pending;
      break;
    case ChildAccountComplianceStates.PERMISSION_GRANTED:
      permissionStatus.message = i18n.sessionLockoutStatusGranted();
      permissionStatus.style = styles.granted;
      break;
    default:
      permissionStatus.message = i18n.sessionLockoutStatusNotSubmitted();
      permissionStatus.style = styles.notSubmitted;
  }

  // Custom form handler to submit the permission request. The default form
  // submission does not include the Referer header, which is required for the
  // policy_compliance_controller to redirect back to the correct page.
  const submitPermissionRequest = async e => {
    e.preventDefault();
    setLoading(true);
    const parentEmail = e.target['parent-email'].value;
    const params = new URLSearchParams({
      'parent-email': parentEmail,
      authenticity_token: csrfToken,
    });

    await fetch(props.apiUrl, {
      method: 'POST',
      body: params,
    });
    setLoading(false);
    setPendingEmail(parentEmail);
    setLastEmailDate(new Date());
    setStatus(ChildAccountComplianceStates.REQUEST_SENT);
  };

  return (
    <div style={styles.container} className="lockout-linked-accounts">
      <hr />
      <h2>{i18n.lockoutManageLinkedAccountsHeader()}</h2>
      <form
        id="lockout-linked-accounts-form"
        action={props.apiUrl}
        method="post"
        onSubmit={submitPermissionRequest}
      >
        <p>{i18n.lockoutManageLinkedAccountsPrompt()}</p>
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
  apiUrl: PropTypes.string.isRequired,
  pendingEmail: PropTypes.string,
  requestDate: PropTypes.instanceOf(Date),
  permissionStatus: PropTypes.string,
  userEmail: PropTypes.string,
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
