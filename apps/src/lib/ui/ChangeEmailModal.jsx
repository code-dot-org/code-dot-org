import React, {PropTypes} from 'react';
import BaseDialog from '@cdo/apps/templates/BaseDialog';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import {isEmail} from '../../util/formatValidation';
import $ from 'jquery';
import MD5 from 'crypto-js/md5';
import {Header, ConfirmCancelFooter} from './SystemDialog/SystemDialog';

/*

Note: This feature is in active development, so there are still some rough edges.
(Brad Buchanan, 2018-05-10)

Spec:
https://docs.google.com/document/d/1eKDnrgorG9koHQF3OdY6nxiO4PIfJ-JCNHGGQu0-G9Y/edit

Task list:
Fix id collisions between this form's fields and the default form fields on
  the account page.
Testing!
Send the email opt-in to the server and handle it correctly
Deduplicate and test client-side email hashing logic
A less clumsy way to use Rails UJS?

 */

const STATE_INITIAL = 'initial';
const STATE_SAVING = 'saving';
const STATE_UNKNOWN_ERROR = 'unknown-error';

export default class ChangeEmailModal extends React.Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    handleCancel: PropTypes.func.isRequired,
    userAge: PropTypes.number.isRequired,
    currentHashedEmail: PropTypes.string,
  };

  state = {
    saveState: STATE_INITIAL,
    newEmail: '',
    newEmailServerError: undefined,
    currentPassword: '',
    currentPasswordServerError: undefined,
    emailOptIn: '',
  };

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

  componentDidMount() {
    this._form = $('form[data-form-for=ChangeEmailModal]');
    if (this._form) {
      this._form.on('ajax:success', this.onSubmitSuccess);
      this._form.on('ajax:error', this.onSubmitFailure);
    } else {
      console.warn('The ChangeEmailModal component did not find the required ' +
        'Rails UJS form, and will be unable to submit changes.');
    }
  }

  componentWillUnmount() {
    if (this._form) {
      this._form.off('ajax:success', this.onSubmitSuccess);
      this._form.off('ajax:error', this.onSubmitFailure);
      delete this._form;
    }
  }

  save = () => {
    if (!this._form) {
      console.error('The ChangeEmailModal component did not find the required ' +
        'Rails UJS form, and was unable to submit changes.');
      return;
    }

    this.setState({saveState: STATE_SAVING}, () => {
      this._form.find('#user_email').val(this.props.userAge < 13 ? '' : this.state.newEmail);
      this._form.find('#user_hashed_email').val(hashEmail(this.state.newEmail));
      this._form.find('#user_current_password').val(this.state.currentPassword);
      // this._form.find('#user_email_opt_in').val(this.state.emailOptIn);
      this._form.submit();
    });
  };

  cancel = () => this.props.handleCancel();

  onSubmitSuccess = () => {
    this.props.handleSubmit(this.state.newEmail, hashEmail(this.state.newEmail));
  };

  onSubmitFailure = (_, xhr) => {
    const validationErrors = xhr.responseJSON;
    if (validationErrors) {
      this.setState({
        saveState: STATE_INITIAL,
        newEmailServerError: validationErrors.email && validationErrors.email[0],
        currentPasswordServerError: validationErrors.current_password && validationErrors.current_password[0],
      }, () => {
        if (this.state.newEmailServerError) {
          this.newEmailInput.focus();
        } else if (this.state.currentPasswordServerError) {
          this.currentPasswordInput.focus();
        }
      });
    } else {
      this.setState({
        saveState: STATE_UNKNOWN_ERROR,
      });
    }
  };

  isFormValid(validationErrors) {
    return Object.keys(validationErrors).every(key => !validationErrors[key]);
  }

  getValidationErrors() {
    const {newEmailServerError, currentPasswordServerError} = this.state;
    return {
      newEmail: newEmailServerError || this.getNewEmailValidationError(),
      currentPassword: currentPasswordServerError || this.getCurrentPasswordValidationError(),
      // emailOptIn: this.getEmailOptInValidationError(),
    };
  }

  getNewEmailValidationError = () => {
    if (this.state.newEmail.trim().length === 0) {
      return i18n.changeEmailModal_newEmail_isRequired();
    }
    if (!isEmail(this.state.newEmail.trim())) {
      return i18n.changeEmailModal_newEmail_invalid();
    }
    if (this.props.currentHashedEmail === hashEmail(this.state.newEmail)) {
      return i18n.changeEmailmodal_newEmail_mustBeDifferent();
    }
    return null;
  };

  getCurrentPasswordValidationError = () => {
    if (this.state.currentPassword.length === 0) {
      return i18n.changeEmailModal_currentPassword_isRequired();
    }
    return null;
  };

  getEmailOptInValidationError = () => {
    if (this.state.emailOptIn.length === 0) {
      return i18n.changeEmailModal_emailOptIn_isRequired();
    }
    return null;
  };

  onNewEmailChange = (event) => this.setState({
    newEmail: event.target.value,
    newEmailServerError: undefined,
  });

  onCurrentPasswordChange = (event) => this.setState({
    currentPassword: event.target.value,
    currentPasswordServerError: undefined,
  });

  onEmailOptInChange = (event) => this.setState({
    emailOptIn: event.target.value,
  });

  onKeyDown = (event) => {
    if (event.key === 'Enter' && this.isFormValid(this.getValidationErrors())) {
      this.save();
    }
  };

  render = () => {
    const {saveState, newEmail, currentPassword, emailOptIn} = this.state;
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
          <div>
            <Field>
              <label
                htmlFor="user_email"
                style={styles.label}
              >
                {i18n.changeEmailModal_newEmail_label()}
              </label>
              <input
                id="user_email"
                type="email"
                value={newEmail}
                disabled={STATE_SAVING === saveState}
                onKeyDown={this.onKeyDown}
                onChange={this.onNewEmailChange}
                autoComplete="off"
                maxLength="255"
                size="255"
                style={styles.input}
                ref={el => this.newEmailInput = el}
              />
              <FieldError>
                {validationErrors.newEmail}
              </FieldError>
            </Field>
            <Field>
              <label
                htmlFor="user_current_password"
                style={styles.label}
              >
                {i18n.changeEmailModal_currentPassword_label()}
              </label>
              <input
                id="user_current_password"
                type="password"
                value={currentPassword}
                disabled={STATE_SAVING === saveState}
                onKeyDown={this.onKeyDown}
                onChange={this.onCurrentPasswordChange}
                maxLength="255"
                size="255"
                style={styles.input}
                ref={el => this.currentPasswordInput = el}
              />
              <FieldError>
                {validationErrors.currentPassword}
              </FieldError>
            </Field>
            <Field style={{display: 'none'}}>
              <p>
                {i18n.changeEmailModal_emailOptIn_description()}
              </p>
              <select
                value={emailOptIn}
                onKeyDown={this.onKeyDown}
                onChange={this.onEmailOptInChange}
                disabled={STATE_SAVING === saveState}
                style={{
                  ...styles.input,
                  width: 100,
                }}
              >
                <option value=""/>
                <option value="yes">
                  {i18n.yes()}
                </option>
                <option value="no">
                  {i18n.no()}
                </option>
              </select>
              <FieldError>
                {validationErrors.emailOptIn}
              </FieldError>
            </Field>
          </div>
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

const Field = ({children, style}) => (
  <div
    style={{
      marginBottom: 15,
      ...style,
    }}
  >
    {children}
  </div>
);
Field.propTypes = {
  children: PropTypes.any,
  style: PropTypes.object,
};

const FieldError = ({children}) => (
  <div
    style={{
      color: color.red,
      fontStyle: 'italic',
    }}
  >
    {children}
  </div>
);
FieldError.propTypes = {children: PropTypes.string};

const styles = {
  container: {
    margin: 20,
    color: color.charcoal,
  },
  label: {
    display: 'block',
    fontWeight: 'bold',
    color: color.charcoal,
  },
  input: {
    marginBottom: 4,
  },
};

function hashEmail(cleartextEmail) {
  return MD5(cleartextEmail).toString();
}
