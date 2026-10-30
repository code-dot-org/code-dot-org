import Modal from '@code-dot-org/component-library/modal';
import PropTypes from 'prop-types';
import React from 'react';

import i18n from '@cdo/locale';

import {isEmail} from '../util/formatValidation';

import ChangeUserTypeForm from './ChangeUserTypeForm';

import styles from './change-user-type-modal.module.scss';

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

  // The DSCO Modal close affordances (X button, Esc) route here; ignore them
  // while a save is in flight, matching the old BaseDialog `uncloseable` prop.
  handleClose = () => {
    if (this.state.saveState !== STATE_SAVING) {
      this.cancel();
    }
  };

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
    const saving = STATE_SAVING === saveState;
    return (
      <Modal
        title={i18n.changeUserTypeModal_title()}
        description={i18n.changeUserTypeModal_description_toTeacher()}
        onClose={this.handleClose}
        closeLabel={i18n.closeDialog()}
        customContent={
          <ChangeUserTypeForm
            ref={x => (this.changeUserTypeForm = x)}
            values={values}
            validationErrors={validationErrors}
            disabled={saving}
            onChange={this.onFormChange}
            onSubmit={this.save}
          />
        }
        primaryButtonProps={{
          children: i18n.changeUserTypeModal_save_teacher(),
          onClick: this.save,
          disabled: saving || !isFormValid,
        }}
        secondaryButtonProps={{
          children: i18n.cancel(),
          onClick: this.cancel,
          disabled: saving,
        }}
        customBottomContent={
          (saving || STATE_UNKNOWN_ERROR === saveState) && (
            <div className={styles.status}>
              {saving && <em>{i18n.saving()}</em>}
              {STATE_UNKNOWN_ERROR === saveState && (
                <em>{i18n.changeUserTypeModal_unexpectedError()}</em>
              )}
            </div>
          )
        }
      />
    );
  };
}
