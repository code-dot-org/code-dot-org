import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Button from '../Button';
import i18n from '@cdo/locale';
import {getStore} from '../../redux';
import {isEmail} from '@cdo/apps/util/formatValidation';
import cookies from 'js-cookie';
import * as color from '../../util/color';
import headerImage from './images/lockout_penguin.png';
import headerThanksImage from './images/dancing_penguin.png';

/**
 * This panel represents the page that is displayed to accounts that are being
 * locked from accessing certain parts of the site until they get parental
 * permission. This panel gives a form to request (or see details about a
 * pending request for) parental permission.
 */
class LockoutPanel extends Component {
  static propTypes = {
    apiURL: PropTypes.string.isRequired,
    deleteDate: PropTypes.instanceOf(Date).isRequired,
    pendingEmail: PropTypes.string,
    requestDate: PropTypes.instanceOf(Date),
  };

  // Set the disabled state of the submit button based on the validity of the
  // email in the field.
  state = {
    disabled: !isEmail(this.props.pendingEmail),
  };

  // When the email field is updated, also update the disability state of the
  // submit button.
  onEmailUpdate = event => {
    this.setState({
      disabled: !isEmail(event.target.value),
    });
  };

  // This will set the email to the current pending email and fire off the
  // form as though they had typed in the same email again.
  resendPermissionEmail = event => {
    // Don't submit the form... we will do that ourselves.
    event.preventDefault();

    const field = document.getElementById('parent-email');
    field.value = this.props.pendingEmail;
    this.submit();
  };

  render() {
    // Get the current locale.
    const locale = cookies.get('language_') || 'en-US';

    // Gather properties.
    const {apiURL, pendingEmail, requestDate, deleteDate} = this.props;

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

    return (
      <div style={styles.container} className="lockout-panel">
        {/* Header image: Depends of if permission request is sent. */}
        <img
          style={styles.image}
          src={pendingEmail ? headerThanksImage : headerImage}
        />

        <h2>
          {pendingEmail
            ? i18n.sessionLockoutPendingHeader()
            : i18n.sessionLockoutNewAccountHeader()}
        </h2>

        {/* This form will post a permission request for the student.*/}
        <form action={apiURL} method="post">
          {/* The top prompt, which depends on whether or not a request is pending. */}
          {pendingEmail && (
            <p>
              {pendingPromptParts[0]}
              <strong>{pendingEmail}</strong>
              {pendingPromptParts[1]}
            </p>
          )}
          {!pendingEmail && <p>{i18n.sessionLockoutPrompt()}</p>}

          {/* The timezone is set to UTC to ensure that the exact date renders. */}
          <p>
            {i18n.sessionLockoutNote({
              deleteDate: deleteDate.toLocaleDateString(locale, {
                ...dateOptions,
                timeZone: 'UTC',
              }),
            })}
          </p>

          {/* This field shows the current status of the validation. */}
          {/* Parent Permission: Not Pending / Pending */}
          <div style={styles.statusSection}>
            <label
              style={isRTL ? styles.statusLabelRTL : styles.statusLabel}
              htmlFor="permission-status"
            >
              <strong>{i18n.sessionLockoutParentStatusField()}</strong>
            </label>
            <span
              id="permission-status"
              style={pendingEmail ? styles.pending : styles.notSubmitted}
            >
              <strong>
                {pendingEmail
                  ? i18n.sessionLockoutStatusPending()
                  : i18n.sessionLockoutStatusNotSubmitted()}
              </strong>
            </span>

            {/* This is a floating 'link' that resends the pending email. */}
            {pendingEmail && (
              <Button
                styleAsText={true}
                style={{...styles.resendLink, float: isRTL ? 'left' : 'right'}}
                text={i18n.sessionLockoutResendEmail()}
                onClick={this.resendPermissionEmail}
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
                  onChange={this.onEmailUpdate}
                  onInput={this.onEmailUpdate}
                  onBlur={this.onEmailUpdate}
                  defaultValue={this.props.pendingEmail}
                  id="parent-email"
                />

                {/* Show a 'Last email sent' prompt when available. */}
                {pendingEmail && (
                  <p style={styles.lastEmail}>
                    <em>
                      Last email sent:{' '}
                      {requestDate.toLocaleDateString(locale, {
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

          {/* A sign-out button. */}
          <Button
            style={styles.button}
            text={i18n.signOutButton()}
            color={Button.ButtonColor.gray}
            href="/users/sign_out"
          />

          {/* The submit button. */}
          {/* An empty onClick will still submit the form. */}
          <Button
            style={{...styles.button, float: isRTL ? 'left' : 'right'}}
            text={
              pendingEmail
                ? i18n.sessionLockoutUpdateSubmit()
                : i18n.sessionLockoutSubmit()
            }
            disabled={this.state.disabled}
            onClick={() => {}}
          />
        </form>
      </div>
    );
  }
}

const styles = {
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
  button: {
    margin: 0,
    marginTop: 5,
  },
};

export default LockoutPanel;
