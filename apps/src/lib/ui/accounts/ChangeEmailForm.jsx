import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
import {Field} from '../SystemDialog/SystemDialog';
import {pegasus} from '../../util/urlHelpers';

export default class ChangeEmailForm extends React.Component {
  static propTypes = {
    values: PropTypes.shape({
      newEmail: PropTypes.string,
      currentPassword: PropTypes.string,
      emailOptIn: PropTypes.string
    }).isRequired,
    validationErrors: PropTypes.shape({
      newEmail: PropTypes.string,
      currentPassword: PropTypes.string,
      emailOptIn: PropTypes.string
    }).isRequired,
    userType: PropTypes.oneOf(['teacher', 'student']).isRequired,
    isPasswordRequired: PropTypes.bool.isRequired,
    disabled: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired
  };

  componentDidMount() {
    this.newEmailInput.focus();
  }

  focusOnAnError() {
    const {validationErrors} = this.props;
    if (validationErrors.newEmail) {
      this.newEmailInput.focus();
    } else if (validationErrors.currentPassword) {
      this.currentPasswordInput.focus();
    }
  }

  onNewEmailChange = event =>
    this.props.onChange({
      ...this.props.values,
      newEmail: event.target.value
    });

  onCurrentPasswordChange = event =>
    this.props.onChange({
      ...this.props.values,
      currentPassword: event.target.value
    });

  onEmailOptInChange = event =>
    this.props.onChange({
      ...this.props.values,
      emailOptIn: event.target.value
    });

  onKeyDown = event => {
    if (event.key === 'Enter' && !this.props.disabled) {
      this.props.onSubmit();
    }
  };

  emailOptInLabelDetails() {
    return (
      <span>
        {i18n.changeEmailModal_emailOptIn_description()}{' '}
        <a
          href={pegasus('/privacy')}
          tabIndex="3"
          target="_blank"
          rel="noopener noreferrer"
        >
          {i18n.changeEmailModal_emailOptIn_privacyPolicy()}
        </a>
      </span>
    );
  }

  render() {
    const {
      values,
      validationErrors,
      disabled,
      userType,
      isPasswordRequired
    } = this.props;
    return (
      <div>
        <Field
          label={i18n.changeEmailModal_newEmail_label()}
          error={validationErrors.newEmail}
        >
          <input
            type="email"
            value={values.newEmail}
            disabled={disabled}
            tabIndex="1"
            onKeyDown={this.onKeyDown}
            onChange={this.onNewEmailChange}
            autoComplete="off"
            maxLength="255"
            size="255"
            style={styles.input}
            ref={el => (this.newEmailInput = el)}
          />
        </Field>
        {isPasswordRequired && (
          <Field
            label={i18n.changeEmailModal_currentPassword_label()}
            error={validationErrors.currentPassword}
          >
            <input
              type="password"
              value={values.currentPassword}
              disabled={disabled}
              tabIndex="1"
              onKeyDown={this.onKeyDown}
              onChange={this.onCurrentPasswordChange}
              maxLength="255"
              size="255"
              style={styles.input}
              ref={el => (this.currentPasswordInput = el)}
            />
          </Field>
        )}
        {userType === 'teacher' && (
          <Field
            labelDetails={this.emailOptInLabelDetails()}
            error={validationErrors.emailOptIn}
          >
            <select
              value={values.emailOptIn}
              disabled={disabled}
              tabIndex="1"
              onKeyDown={this.onKeyDown}
              onChange={this.onEmailOptInChange}
              style={{
                ...styles.input,
                width: 100
              }}
              ref={el => (this.emailOptInSelect = el)}
            >
              <option value="" />
              <option value="yes">{i18n.yes()}</option>
              <option value="no">{i18n.no()}</option>
            </select>
          </Field>
        )}
      </div>
    );
  }
}

const styles = {
  input: {
    marginBottom: 4
  }
};
