import TextField from '@code-dot-org/component-library/textField';
import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import i18n from '@cdo/locale';

import * as utils from '../utils';

import styles from './add-password-form.module.scss';
import commonStyles from './common/common.styles.module.scss';

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
    isError: false,
  },
};

export default class AddPasswordForm extends React.Component {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    userAge: PropTypes.number,
    userUsState: PropTypes.string,
  };

  state = DEFAULT_STATE;

  onPasswordChange = event => {
    this.setState({
      // Clear any existing submission state
      submissionState: DEFAULT_STATE.submissionState,
      password: event.target.value,
    });
  };

  onPasswordConfirmationChange = event => {
    this.setState({
      // Clear any existing submission state
      submissionState: DEFAULT_STATE.submissionState,
      passwordConfirmation: event.target.value,
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
        message: SAVING_STATE,
      },
    });
    this.props
      .handleSubmit(password, passwordConfirmation)
      .then(this.onSuccess, this.onFailure);
  };

  onSuccess = () => {
    this.setState({
      ...DEFAULT_STATE,
      submissionState: {
        message: SUCCESS_STATE,
      },
    });
    utils.reload();
  };

  onFailure = error => {
    this.setState({
      submissionState: {
        message: error.message,
        isError: true,
      },
    });
  };

  render() {
    const {password, passwordConfirmation, submissionState} = this.state;
    const {disabled, userAge, userUsState} = this.props;
    const disabledHint =
      userAge && userUsState
        ? i18n.manageLinkedAccounts_parentalPermissionRequired()
        : i18n.manageLinkedAccounts_ageAndStateRequired();

    return (
      <div className={styles.container}>
        <hr className={commonStyles.sectionDivider} />
        <MuiTypography variant="h5" component="h2" gutterBottom>
          {i18n.addPassword()}
        </MuiTypography>
        <MuiTypography variant="body2" className={styles.hint}>
          {disabled ? disabledHint : i18n.addPasswordHint()}
        </MuiTypography>
        <TextField
          name="password"
          inputType="password"
          label={i18n.password()}
          errorMessage={this.minimumLengthError(password)}
          value={password}
          onChange={this.onPasswordChange}
          maxLength={255}
          disabled={disabled}
        />
        <TextField
          name="passwordConfirmation"
          inputType="password"
          label={i18n.passwordConfirmation()}
          errorMessage={
            this.minimumLengthError(passwordConfirmation) ||
            this.mismatchedPasswordsError()
          }
          value={passwordConfirmation}
          onChange={this.onPasswordConfirmationChange}
          maxLength={255}
          disabled={disabled}
        />
        <div className={styles.buttonContainer}>
          <div
            id="uitest-add-password-status"
            className={classNames(styles.statusText, {
              [styles.errorText]: submissionState.isError,
            })}
          >
            {submissionState.message}
          </div>
          <MuiButton
            type="button"
            variant="contained"
            color="primary"
            size="small"
            onClick={this.handleSubmit}
            disabled={!this.isFormValid()}
          >
            {i18n.createPassword()}
          </MuiButton>
        </div>
      </div>
    );
  }
}
