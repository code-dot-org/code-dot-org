import cookies from 'js-cookie';
import React, {CSSProperties, useState} from 'react';

import {isEmail} from '@cdo/apps/util/formatValidation';
import i18n from '@cdo/locale';
import headerThanksImage from '@cdo/static/common_images/penguin/dancing.png';
import headerImage from '@cdo/static/common_images/penguin/yelling.png';

import {getStore} from '../../redux';
import * as color from '../../util/color';
import {hashString} from '../../utils';
import Button from '../Button';

/**
 * This panel represents the page that is displayed to accounts that are being
 * locked from accessing certain parts of the site until they get parental
 * permission. This panel gives a form to request (or see details about a
 * pending request for) parental permission.
 */
const LockoutPanel: React.FC<LockoutPanelProps> = props => {
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
  const [disabled, setDisabled] = useState(
    () => !validateEmail(props.pendingEmail)
  );

  // When the email field is updated, also update the disability state of the
  // submit button.
  const onEmailUpdate = (event: React.FormEvent<HTMLInputElement>) => {
    setDisabled(!validateEmail((event.target as HTMLInputElement).value));
  };

  // This will set the email to the current pending email and fire off the
  // form as though they had typed in the same email again.
  const resendPermissionEmail = () => {
    const field = document.getElementById('parent-email') as HTMLInputElement;
    if (field && props.pendingEmail) {
      field.value = props.pendingEmail;
    }

    const form = document.getElementById(
      'lockout-panel-form'
    ) as HTMLFormElement;
    if (form) {
      form.submit();
    }
  };

  const signOut = (event: React.MouseEvent<HTMLButtonElement>) => {
    window.location.href = 'users/sign_out';
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

  const tokenElement = document.querySelector('meta[name="csrf-token"]');
  let csrfToken = '';
  if (tokenElement) {
    const content = tokenElement.attributes.getNamedItem('content');
    if (content) {
      csrfToken = content.value;
    }
  }

  return (
    <div style={styles.container} className="lockout-panel">
      {/* Header image: Depends of if permission request is sent. */}
      <img
        style={styles.image}
        src={props.pendingEmail ? headerThanksImage : headerImage}
        alt={
          props.pendingEmail
            ? i18n.sessionLockoutHeaderThanksDescription()
            : i18n.sessionLockoutHeaderDescription()
        }
      />

      <h2>
        {props.pendingEmail
          ? i18n.sessionLockoutPendingHeader()
          : props.isPreLockoutUser
          ? i18n.sessionLockoutNewPreLockoutAccountHeader()
          : i18n.sessionLockoutNewAccountHeader()}
      </h2>

      {/* This form will post a permission request for the student.*/}
      <form id="lockout-panel-form" action={props.apiURL} method="post">
        <input type="hidden" value={csrfToken} name="authenticity_token" />
        {/* The top prompt, which depends on whether or not a request is pending. */}
        {props.pendingEmail && (
          <p>
            {pendingPromptParts[0]}
            <strong>{props.pendingEmail}</strong>
            {pendingPromptParts[1]}
          </p>
        )}
        {!props.pendingEmail && (
          <p>
            {props.isPreLockoutUser
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
            <span
              id="permission-status"
              style={props.pendingEmail ? styles.pending : styles.notSubmitted}
            >
              <strong>
                {props.pendingEmail
                  ? i18n.sessionLockoutStatusPending()
                  : i18n.sessionLockoutStatusNotSubmitted()}
              </strong>
            </span>
          </div>

          {/* This is a floating 'link' that resends the pending email. */}
          {props.pendingEmail && (
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
                defaultValue={props.pendingEmail}
                name="parent-email"
                id="parent-email"
              />

              {/* Show a 'Last email sent' prompt when available. */}
              {props.pendingEmail && props.requestDate && (
                <p style={styles.lastEmail}>
                  <em id="lockout-last-email-date">
                    {i18n.sessionLockoutLastEmailSent() + ' '}
                    {props.requestDate.toLocaleDateString(locale, {
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
          <Button
            id="lockout-submit"
            type="submit"
            style={styles.button}
            text={
              props.pendingEmail
                ? i18n.sessionLockoutUpdateSubmit()
                : i18n.sessionLockoutSubmit()
            }
            disabled={disabled}
            onClick={() => {}}
          />
        </div>
      </form>
    </div>
  );
};

export interface LockoutPanelProps {
  apiURL: string;
  deleteDate: Date;
  pendingEmail?: string;
  requestDate?: Date;
  disallowedEmail: string;
  isPreLockoutUser?: boolean;
}

LockoutPanel.defaultProps = {
  isPreLockoutUser: false,
};

export default LockoutPanel;

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
