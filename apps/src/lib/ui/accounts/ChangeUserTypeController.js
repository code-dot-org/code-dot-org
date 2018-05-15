import React from 'react';
import ReactDOM from "react-dom";
import ChangeUserTypeModal from './ChangeUserTypeModal';

export default class ChangeUserTypeController {
  /**
   * Attach handlers and behaviors for the part of the accounts page that
   * lets the user change their account type from student to teacher, or from
   * teacher to student.
   *
   * @param {!jQuery} form - jQuery wrapper for the Form element that we'll use
   *   to submit account type changes.  This module will only interact with
   *   children of that form element.
   * @param {!string} initialUserType
   * @param {!boolean} isOauth
   */
  constructor(form, initialUserType, isOauth) {
    this.form = form;
    this.initialUserType = initialUserType;
    this.isOauth = isOauth;
    this.dropdown = form.find('#change-user-type_user_user_type');
    this.button = form.find('#change-user-type-button');


    // Attach handlers
    this.dropdown.change(e => this.onUserTypeDropdownChange(e.target.value));
    this.button.click(this.onUserTypeChangeButtonClick);

    // Set initial state
    this.onUserTypeDropdownChange(initialUserType);
  }

  // Enable or disable the submit button for changing user type based on
  // whether the selected user type is actually different than the user's
  // current type.
  onUserTypeDropdownChange = (selectedType) => {
    this.button.prop('disabled', selectedType === this.initialUserType);
  };

  onUserTypeChangeButtonClick = (e) => {
    // Email confirmation is required when changing from a student account
    // to a teacher account.
    const needEmailConfirmation = this.dropdown.val() === 'teacher';
    // Confirm the user's password for this change, unless the user doesn't
    // have a password.
    const needPasswordConfirmation = !this.isOauth;

    if (needEmailConfirmation || needPasswordConfirmation) {
      this.showChangeUserTypeModal({needEmailConfirmation, needPasswordConfirmation});
    } else {
      // Submit form now?
    }

    e.preventDefault();
  };

  showChangeUserTypeModal() {
    const targetUserType = this.dropdown.val();
    const userHashedEmail= document.getElementById('change-user-type_user_hashed_email').value;
    const handleSubmit = (values) => (
      this.submitUserTypeChange(values)
        .then(() => window.location.reload())
    );

    this.mountPoint = document.createElement('div');
    document.body.appendChild(this.mountPoint);
    ReactDOM.render(
      <ChangeUserTypeModal
        targetUserType={targetUserType}
        currentHashedEmail={userHashedEmail}
        handleSubmit={handleSubmit}
        handleCancel={this.hideChangeUserTypeModal}
      />,
      this.mountPoint
    );
  }

  hideChangeUserTypeModal = () => {
    ReactDOM.unmountComponentAtNode(this.mountPoint);
    document.body.removeChild(this.mountPoint);
  };

  /**
   * Submit a user type change using the Rails-generated async form.
   * @param {{currentEmail: string, currentPassword: string}} values
   * @return {Promise} which may reject with an error or object containing
   *   serverErrors.
   */
  submitUserTypeChange(values) {
    return new Promise((resolve, reject) => {
      const onSuccess = () => {
        detachHandlers();
        resolve();
      };

      const onFailure = (_, xhr) => {
        const validationErrors = xhr.responseJSON;
        let error;
        if (validationErrors) {
          error = {
            serverErrors: {
              currentEmail: validationErrors.email && validationErrors.email[0],
              currentPassword: validationErrors.current_password && validationErrors.current_password[0],
            }
          };
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
      this.form.find('#change-user-type_user_email').val(values.currentEmail);
      this.form.find('#change-user-type_user_current_password').val(values.currentPassword);
      this.form.submit();
    });
  }
}
