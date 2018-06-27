import React, {PropTypes} from 'react';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import {Field} from '../SystemDialog/SystemDialog';
import BootstrapButton from './BootstrapButton';

const styles = {
  container: {
    paddingTop: 20,
  },
  header: {
    fontSize: 22,
  },
  hint: {
    marginTop: 10,
    marginBottom: 10,
  },
  input: {
    marginBottom: 4,
  },
  buttonContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  statusText: {
    paddingLeft: 10,
    paddingRight: 10,
    fontStyle: 'italic',
  },
  errorText: {
    color: color.red,
  },
};

export const SAVING_STATE = i18n.saving();
export const SUCCESS_STATE = i18n.success();
export const PASSWORDS_MUST_MATCH = i18n.passwordsMustMatch();

const DEFAULT_STATE = {
  password: '',
  passwordConfirmation: '',
  submissionState: {
    message: '',
    isError: false
  },
};

export default class AddPasswordForm extends React.Component {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired
  };

  state = DEFAULT_STATE;

  onPasswordChange = (event) => {
    this.setState({
      // Clear any existing submission state
      submissionState: DEFAULT_STATE.submissionState,
      password: event.target.value
    });
  };

  onPasswordConfirmationChange = (event) => {
    this.setState({
      // Clear any existing submission state
      submissionState: DEFAULT_STATE.submissionState,
      passwordConfirmation: event.target.value
    });
  };

  passwordFieldsHaveContent = () => {
    const {password, passwordConfirmation} = this.state;
    return password.length > 0 && passwordConfirmation.length > 0;
  };

  isFormValid = () => {
    const {password, passwordConfirmation} = this.state;
    return this.passwordFieldsHaveContent() && (password === passwordConfirmation);
  };

  mismatchedPasswordsError = () => {
    if (this.passwordFieldsHaveContent() && !this.isFormValid()) {
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
    this.props.handleSubmit(password, passwordConfirmation)
      .then(this.onSuccess, this.onFailure);
  };

  onSuccess = () => {
    this.setState({
      ...DEFAULT_STATE,
      submissionState: {
        message: SUCCESS_STATE
      }
    });
  };

  onFailure = (error) => {
    this.setState({
      submissionState: {
        message: error.message,
        isError: true
      }
    });
  };

  render() {
    const {submissionState} = this.state;
    let statusTextStyles = styles.statusText;
    statusTextStyles = submissionState.isError ? {...statusTextStyles, ...styles.errorText} : statusTextStyles;

    return (
      <div style={styles.container}>
        <hr/>
        <h2 style={styles.header}>
          {i18n.addPassword()}
        </h2>
        <div style={styles.hint}>
          {i18n.addPasswordHint()}
        </div>
        <PasswordField
          label={i18n.password()}
          value={this.state.password}
          onChange={this.onPasswordChange}
        />
        <PasswordField
          label={i18n.passwordConfirmation()}
          error={this.mismatchedPasswordsError()}
          value={this.state.passwordConfirmation}
          onChange={this.onPasswordConfirmationChange}
        />
        <div style={styles.buttonContainer}>
          <div
            id="uitest-add-password-status"
            style={statusTextStyles}
          >
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
    onChange: PropTypes.func.isRequired,
  };

  render() {
    const {label, value, onChange, error} = this.props;
    return (
      <Field
        label={label}
        error={error}
      >
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
