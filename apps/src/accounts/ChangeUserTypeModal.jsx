import PropTypes from 'prop-types';
import React from 'react';

import i18n from '@cdo/locale';

import {
  Header,
  ConfirmCancelFooter,
} from '../sharedComponents/SystemDialog/SystemDialog';
import BaseDialog from '../templates/BaseDialog';
import color from '../util/color';
import {isEmail} from '../util/formatValidation';

import ChangeUserTypeForm from './ChangeUserTypeForm';

const STATE_INITIAL = 'initial';
const STATE_SAVING = 'saving';
const STATE_UNKNOWN_ERROR = 'unknown-error';

export default class ChangeUserTypeModal extends React.Component {
  static propTypes = {
    /**
     * @type {function({email: string, emailOptIn: string}):Promise}
     */
    handleSubmit: PropTypes.func.isRequired,
    /**
     * @type {function()}
     */
    handleCancel: PropTypes.func.isRequired,
  };

  state = {
    saveState: STATE_INITIAL,
    values: {
      email: '',
      emailOptIn: '',
    },
    serverErrors: {
      email: undefined,
      emailOptIn: undefined,
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
        () => this.changeUserTypeForm.focusOnAnError()
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
      email: serverErrors.email || this.getEmailValidationError(),
      emailOptIn:
        serverErrors.emailOptIn || this.getEmailOptInValidationError(),
    };
  }

  getEmailValidationError = () => {
    const {email} = this.state.values;
    if (email.trim().length === 0) {
      return i18n.changeUserTypeModal_email_isRequired();
    }
    if (!isEmail(email.trim())) {
      return i18n.changeUserTypeModal_email_invalid();
    }
    return null;
  };

  getEmailOptInValidationError = () => {
    const {emailOptIn} = this.state.values;
    if (emailOptIn.length === 0) {
      return i18n.changeUserTypeModal_emailOptIn_isRequired();
    }
    return null;
  };

  onFormChange = newValues => {
    const {values: oldValues, serverErrors} = this.state;
    const newServerErrors = {...serverErrors};
    ['email', 'emailOptIn'].forEach(fieldName => {
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
          <Header text={i18n.changeUserTypeModal_title()} />
          <ChangeUserTypeForm
            ref={x => (this.changeUserTypeForm = x)}
            values={values}
            validationErrors={validationErrors}
            disabled={STATE_SAVING === saveState}
            onChange={this.onFormChange}
            onSubmit={this.save}
          />
          <ConfirmCancelFooter
            confirmText={i18n.changeUserTypeModal_save_teacher()}
            onConfirm={this.save}
            onCancel={this.cancel}
            disableConfirm={STATE_SAVING === saveState || !isFormValid}
            disableCancel={STATE_SAVING === saveState}
            tabIndex="2"
          >
            {STATE_SAVING === saveState && <em>{i18n.saving()}</em>}
            {STATE_UNKNOWN_ERROR === saveState && (
              <em>{i18n.changeUserTypeModal_unexpectedError()}</em>
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
