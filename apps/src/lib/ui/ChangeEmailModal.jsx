import React, {PropTypes} from 'react';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import {hashEmail} from '../../code-studio/hashEmail';
import {isEmail} from '../../util/formatValidation';
import $ from 'jquery';
import {Header, ConfirmCancelFooter} from './SystemDialog/SystemDialog';
import ChangeEmailForm from './ChangeEmailForm';

/*

Note: This feature is in active development, so there are still some rough edges.
(Brad Buchanan, 2018-05-10)

Spec:
https://docs.google.com/document/d/1eKDnrgorG9koHQF3OdY6nxiO4PIfJ-JCNHGGQu0-G9Y/edit

Task list:
Send the email opt-in to the server and handle it correctly

 */

const STATE_INITIAL = 'initial';
const STATE_SAVING = 'saving';
const STATE_UNKNOWN_ERROR = 'unknown-error';

//
// Note: This dialog submits account changes to dashboard using a
// hidden Rails-generated form.  It expects that form to already exist in the
// DOM when the component mounts and to have a particular data attribute.
//
// When the user clicks the "update" button, this dialog loads the relevant
// information into the hidden Rails form and calls submit(). Rails injects
// all the JavaScript needed for the form to submit via AJAX with all the
// appropriate validation tokens, etc.  The dialog subscribes to events
// emitted by the Rails helper JavaScript to detect success or errors.
//
// If the dialog can't find the Rails form anywhere it will emit a warning
// and be unable to submit anything (useful for tests and storybook).
//
// Read more:
// http://guides.rubyonrails.org/working_with_javascript_in_rails.html#rails-ujs-event-handlers
// https://github.com/rails/jquery-ujs
//
export default class ChangeEmailModal extends React.Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    handleCancel: PropTypes.func.isRequired,
    railsForm: PropTypes.object.isRequired,
    userAge: PropTypes.number.isRequired,
    currentHashedEmail: PropTypes.string,
  };

  state = {
    saveState: STATE_INITIAL,
    values: {
      newEmail: '',
      currentPassword: '',
    },
    serverErrors: {
      newEmail: '',
      currentPassword: ''
    },
  };

  componentDidMount() {
    this._form = $(this.props.railsForm);
    this._form.on('ajax:success', this.onSubmitSuccess);
    this._form.on('ajax:error', this.onSubmitFailure);
  }

  componentWillUnmount() {
    this._form.off('ajax:success', this.onSubmitSuccess);
    this._form.off('ajax:error', this.onSubmitFailure);
    delete this._form;
  }

  save = () => {
    // No-op if we know the form is invalid, client-side.
    // This blocks return-key submission when the form is invalid.
    if (!this.isFormValid(this.getValidationErrors())) {
      return;
    }

    const {newEmail, currentPassword} = this.state.values;
    this.setState({saveState: STATE_SAVING}, () => {
      this._form.find('#change-email-modal_user_email').val(this.props.userAge < 13 ? '' : newEmail);
      this._form.find('#change-email-modal_user_hashed_email').val(hashEmail(newEmail));
      this._form.find('#change-email-modal_user_current_password').val(currentPassword);
      this._form.submit();
    });
  };

  cancel = () => this.props.handleCancel();

  onSubmitSuccess = () => this.props.handleSubmit(this.state.values.newEmail);

  onSubmitFailure = (_, xhr) => {
    const validationErrors = xhr.responseJSON;
    if (validationErrors) {
      this.setState({
        saveState: STATE_INITIAL,
        serverErrors: {
          newEmail: validationErrors.email && validationErrors.email[0],
          currentPassword: validationErrors.current_password && validationErrors.current_password[0],
        }
      }, () => this.changeEmailForm.focusOnAnError());
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
      currentPassword: serverErrors.currentPassword || this.getCurrentPasswordValidationError(),
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
      return i18n.changeEmailmodal_newEmail_mustBeDifferent();
    }
    return null;
  };

  getCurrentPasswordValidationError = () => {
    const {currentPassword} = this.state.values;
    if (currentPassword.length === 0) {
      return i18n.changeEmailModal_currentPassword_isRequired();
    }
    return null;
  };

  onFormChange = (newValues) => {
    const {values: oldValues, serverErrors} = this.state;
    const newServerErrors = {...serverErrors};
    if (newValues.newEmail !== oldValues.newEmail) {
      newServerErrors.newEmail = undefined;
    }
    if (newValues.currentPassword !== oldValues.currentPassword) {
      newServerErrors.currentPassword = undefined;
    }
    this.setState({
      values: newValues,
      serverErrors: newServerErrors
    });
  };

  render = () => {
    const {saveState, values} = this.state;
    const validationErrors = this.getValidationErrors();
    const isFormValid = this.isFormValid(validationErrors);
    return (
      <BaseDialog
        useUpdatedStyles
        isOpen={this.props.isOpen}
        handleClose={this.cancel}
        uncloseable={STATE_SAVING === saveState}
      >
        <div style={styles.container}>
          <Header text={i18n.changeEmailModal_title()}/>
          <ChangeEmailForm
            ref={x => this.changeEmailForm = x}
            values={values}
            validationErrors={validationErrors}
            disabled={STATE_SAVING === saveState}
            onChange={this.onFormChange}
            onSubmit={this.save}
          />
          <ConfirmCancelFooter
            confirmText={i18n.changeEmailModal_save()}
            onConfirm={this.save}
            onCancel={this.cancel}
            disableConfirm={STATE_SAVING === saveState || !isFormValid}
            disableCancel={STATE_SAVING === saveState}
          >
            {(STATE_SAVING === saveState) &&
              <em>{i18n.saving()}</em>}
            {(STATE_UNKNOWN_ERROR === saveState) &&
              <em>{i18n.changeEmailModal_unexpectedError()}</em>}
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
  }
};
