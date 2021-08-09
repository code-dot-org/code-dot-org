import PropTypes from 'prop-types';
import React from 'react';
import i18n from '@cdo/locale';
import * as utils from '../../../utils';
import color from '@cdo/apps/util/color';
import {Field} from '../SystemDialog/SystemDialog';
import BootstrapButton from './BootstrapButton';

const MIN_PASSWORD_LENGTH = 6;
export const SAVING_STATE = i18n.saving();
export const SUCCESS_STATE = i18n.success();
export const PASSWORD_TOO_SHORT = i18n.passwordTooShort();
export const PASSWORDS_MUST_MATCH = i18n.passwordsMustMatch();

const DEFAULT_STATE = {
  password: '',
  passwordConfirmation: '',
  submissionState: {
    message: '',
    isError: false
  }
};

export default class AddPasswordForm extends React.Component {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired
  };

  state = DEFAULT_STATE;

  onPasswordChange = event => {
    this.setState({
      // Clear any existing submission state
      submissionState: DEFAULT_STATE.submissionState,
      password: event.target.value
    });
  };

  onPasswordConfirmationChange = event => {
    this.setState({
      // Clear any existing submission state
      submissionState: DEFAULT_STATE.submissionState,
      passwordConfirmation: event.target.value
    });
  };

  passwordsHaveMinimumContent = () => {
    const {password, passwordConfirmation} = this.state;
    return (
      password.length >= MIN_PASSWORD_LENGTH &&
      passwordConfirmation.length >= MIN_PASSWORD_LENGTH
    );
  };

  passwordsMatch = () => {
    const {password, passwordConfirmation} = this.state;
    return password === passwordConfirmation;
  };

  isFormValid = () => {
    return this.passwordsHaveMinimumContent() && this.passwordsMatch();
  };

  minimumLengthError = value => {
    if (value.length > 0 && value.length < MIN_PASSWORD_LENGTH) {
      return PASSWORD_TOO_SHORT;
    }
  };

  mismatchedPasswordsError = () => {
    if (this.passwordsHaveMinimumContent() && !this.passwordsMatch()) {
      return PASSWORDS_MUST_MATCH;
    }
  };

  handleSubmit = () => {
    const {password, passwordConfirmation} = this.state;
    this.setState({
      ...DEFAULT_STATE.submissionState,
      submissionState: {
        message: SAVING_STATE
      }
    });
    this.props
      .handleSubmit(password, passwordConfirmation)
      .then(this.onSuccess, this.onFailure);
  };

  onSuccess = () => {
    this.setState({
      ...DEFAULT_STATE,
      submissionState: {
        message: SUCCESS_STATE
      }
    });
    utils.reload();
  };

  onFailure = error => {
    this.setState({
      submissionState: {
        message: error.message,
        isError: true
      }
    });
  };

  render() {
    const {password, passwordConfirmation, submissionState} = this.state;
    let statusTextStyles = styles.statusText;
    statusTextStyles = submissionState.isError
      ? {...statusTextStyles, ...styles.errorText}
      : statusTextStyles;

    return (
      <div style={styles.container}>
        <hr />
        <h2 style={styles.header}>{i18n.addPassword()}</h2>
        <div style={styles.hint}>{i18n.addPasswordHint()}</div>
        <PasswordField
          label={i18n.password()}
          error={this.minimumLengthError(password)}
          value={password}
          onChange={this.onPasswordChange}
        />
        <PasswordField
          label={i18n.passwordConfirmation()}
          error={
            this.minimumLengthError(passwordConfirmation) ||
            this.mismatchedPasswordsError()
          }
          value={passwordConfirmation}
          onChange={this.onPasswordConfirmationChange}
        />
        <div style={styles.buttonContainer}>
          <div id="uitest-add-password-status" style={statusTextStyles}>
            {submissionState.message}
          </div>
          {/* This button intentionally uses BootstrapButton to match other account page buttons */}
          <BootstrapButton
            text={i18n.createPassword()}
            onClick={this.handleSubmit}
            disabled={!this.isFormValid()}
          />
        </div>
      </div>
    );
  }
}

class PasswordField extends React.Component {
  static propTypes = {
    label: PropTypes.string.isRequired,
    error: PropTypes.string,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
  };

  render() {
    const {label, value, onChange, error} = this.props;
    return (
      <Field label={label} error={error}>
        <input
          type="password"
          value={value}
          tabIndex="1"
          onChange={onChange}
          maxLength="255"
          size="255"
          style={styles.input}
        />
      </Field>
    );
  }
}

const styles = {
  container: {
    paddingTop: 20
  },
  header: {
    fontSize: 22
  },
  hint: {
    marginTop: 10,
    marginBottom: 10
  },
  input: {
    marginBottom: 4
  },
  buttonContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  statusText: {
    paddingLeft: 10,
    paddingRight: 10,
    fontStyle: 'italic'
  },
  errorText: {
    color: color.red
  }
};
