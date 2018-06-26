import React from 'react';
import ReactDOM from 'react-dom';
import AddPasswordForm from './AddPasswordForm';

export default class AddPasswordController {
  constructor(form, mountPoint) {
    this.form = form;
    this.mountPoint = mountPoint;
    this.renderAddPasswordForm();
  }

  renderAddPasswordForm = () => {
    ReactDOM.render(
      <AddPasswordForm handleSubmit={this.submitAddPassword}/>,
      this.mountPoint
    );
  };

  submitAddPassword = (password, passwordConfirmation) => {
    return new Promise((resolve, reject) => {
      const onSuccess = () => {
        detachHandlers();
        resolve();
      };

      const onFailure = (_, xhr) => {
        const validationErrors = xhr.responseJSON;
        let error;
        if (validationErrors && validationErrors.password) {
          error = new Error(validationErrors.password[0]);
        } else {
          error = new Error('Unexpected failure: ' + xhr.status);
        }
        detachHandlers();
        reject(error);
      };

      // Subscribe to jquery-ujs events before we submit, and unsubscribe after
      // the request is complete.
      const detachHandlers = () => {
        this.form.on('ajax:success', onSuccess);
        this.form.on('ajax:error', onFailure);
      };
      this.form.on('ajax:success', onSuccess);
      this.form.on('ajax:error', onFailure);
      this.form.find('#add-password_user_password').val(password);
      this.form.find('#add-password_user_password_confirmation').val(passwordConfirmation);
      this.form.submit();
    });
  };
}
