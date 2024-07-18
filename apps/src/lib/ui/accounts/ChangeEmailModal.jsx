import PropTypes from 'prop-types';
import React from 'react';

import i18n from '@cdo/locale';

import {hashEmail} from '../../../code-studio/hashEmail';
import BaseDialog from '../../../templates/BaseDialog';
import color from '../../../util/color';
import {isEmail} from '../../../util/formatValidation';
import {Header, ConfirmCancelFooter} from '../SystemDialog/SystemDialog';

import ChangeEmailForm from './ChangeEmailForm';

const STATE_INITIAL = 'initial';
const STATE_SAVING = 'saving';
const STATE_UNKNOWN_ERROR = 'unknown-error';

export default class ChangeEmailModal extends React.Component {
  static propTypes = {
    /**
     * @type {function({newEmail: string, currentPassword: string}):Promise}
     */
    handleSubmit: PropTypes.func.isRequired,
    /**
     * @type {function()}
     */
    handleCancel: PropTypes.func.isRequired,
    userType: PropTypes.oneOf(['student', 'teacher']).isRequired,
    isPasswordRequired: PropTypes.bool.isRequired,
    currentHashedEmail: PropTypes.string,
  };

  state = {
    saveState: STATE_INITIAL,
    values: {
      newEmail: '',
      currentPassword: '',
      emailOptIn: '',
    },
    serverErrors: {
      newEmail: '',
      currentPassword: '',
      emailOptIn: '',
    },
  };

  save = () => {
    // No-op if we know the form is invalid, client-side.
    // This blocks return-key submission when the form is invalid.
    if (!this.isFormValid(this.getValidationErrors())) {
      return;
    }

    const {values} = this.state;
    this.setState({saveState: STATE_SAVING});
    this.props.handleSubmit(values).catch(this.onSubmitFailure);
  };

  cancel = () => this.props.handleCancel();

  onSubmitFailure = error => {
    if (error && Object.prototype.hasOwnProperty.call(error, 'serverErrors')) {
      this.setState(
        {
          saveState: STATE_INITIAL,
          serverErrors: error.serverErrors,
        },
        () => this.changeEmailForm.focusOnAnError()
      );
    } else {
      this.setState({saveState: STATE_UNKNOWN_ERROR});
    }
  };

  isFormValid(validationErrors) {
    return Object.keys(validationErrors).every(key => !validationErrors[key]);
  }

  getValidationErrors() {
    const {serverErrors} = this.state;
    return {
      newEmail: serverErrors.newEmail || this.getNewEmailValidationError(),
      currentPassword:
        serverErrors.currentPassword ||
        this.getCurrentPasswordValidationError(),
      emailOptIn:
        serverErrors.emailOptIn || this.getEmailOptInValidationError(),
    };
  }

  getNewEmailValidationError = () => {
    const {newEmail} = this.state.values;
    const {currentHashedEmail} = this.props;
    if (newEmail.trim().length === 0) {
      return i18n.changeEmailModal_newEmail_isRequired();
    }
    if (!isEmail(newEmail.trim())) {
      return i18n.changeEmailModal_newEmail_invalid();
    }
    if (currentHashedEmail === hashEmail(newEmail)) {
      return i18n.changeEmailModal_newEmail_mustBeDifferent();
    }
    return null;
  };

  getCurrentPasswordValidationError = () => {
    const {currentPassword} = this.state.values;
    if (this.props.isPasswordRequired && currentPassword.length === 0) {
      return i18n.changeEmailModal_currentPassword_isRequired();
    }
    return null;
  };

  getEmailOptInValidationError = () => {
    const {userType} = this.props;
    const {emailOptIn} = this.state.values;
    if (userType === 'teacher' && emailOptIn.length === 0) {
      return i18n.changeEmailModal_emailOptIn_isRequired();
    }
    return null;
  };

  onFormChange = newValues => {
    const {values: oldValues, serverErrors} = this.state;
    const newServerErrors = {...serverErrors};
    ['newEmail', 'currentPassword', 'emailOptIn'].forEach(fieldName => {
      if (newValues[fieldName] !== oldValues[fieldName]) {
        newServerErrors[fieldName] = undefined;
      }
    });
    this.setState({
      values: newValues,
      serverErrors: newServerErrors,
    });
  };

  render = () => {
    const {userType, isPasswordRequired} = this.props;
    const {saveState, values} = this.state;
    const validationErrors = this.getValidationErrors();
    const isFormValid = this.isFormValid(validationErrors);
    return (
      <BaseDialog
        useUpdatedStyles
        isOpen
        handleClose={this.cancel}
        uncloseable={STATE_SAVING === saveState}
      >
        <div style={styles.container}>
          <Header text={i18n.changeEmailModal_title()} />
          <ChangeEmailForm
            ref={x => (this.changeEmailForm = x)}
            values={values}
            validationErrors={validationErrors}
            disabled={STATE_SAVING === saveState}
            userType={userType}
            isPasswordRequired={isPasswordRequired}
            onChange={this.onFormChange}
            onSubmit={this.save}
          />
          <ConfirmCancelFooter
            confirmText={i18n.changeEmailModal_save()}
            onConfirm={this.save}
            onCancel={this.cancel}
            disableConfirm={STATE_SAVING === saveState || !isFormValid}
            disableCancel={STATE_SAVING === saveState}
            tabIndex="2"
          >
            {STATE_SAVING === saveState && <em>{i18n.saving()}</em>}
            {STATE_UNKNOWN_ERROR === saveState && (
              <em>{i18n.changeEmailModal_unexpectedError()}</em>
            )}
          </ConfirmCancelFooter>
        </div>
      </BaseDialog>
    );
  };
}

const styles = {
  container: {
    margin: 20,
    color: color.charcoal,
  },
};
