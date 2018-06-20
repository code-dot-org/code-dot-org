import React from 'react';
import ReactDOM from 'react-dom';
import AddPasswordForm from './AddPasswordForm';

export default class AddPasswordController {
  constructor(form, mountPoint) {
    this.form = form;
    this.renderAddPasswordForm(mountPoint);
  }

  renderAddPasswordForm = (mountPoint) => {
    ReactDOM.render(
      <AddPasswordForm handleSubmit={this.submitAddPassword}/>,
      mountPoint
    );
  };

  submitAddPassword = (password, passwordConfirmation) => {
    return new Promise((resolve, reject) => {
      const onSuccess = () => {
        detachHandlers();
        resolve();
      };

      const onFailure = (_, xhr) => {
        // const validationErrors = xhr.responseJSON;
        // let error;
        // if (validationErrors) {
        //   error = {
        //     serverErrors: {
        //       newEmail: validationErrors.email && validationErrors.email[0],
        //       currentPassword: validationErrors.current_password && validationErrors.current_password[0],
        //     }
        //   };
        // } else {
        //   error = new Error('Unexpected failure: ' + xhr.status);
        // }
        detachHandlers();
        reject(xhr.responseJSON);
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
