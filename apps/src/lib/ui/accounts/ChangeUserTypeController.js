import React from 'react';
import ReactDOM from 'react-dom';

import i18n from '@cdo/locale';

import * as utils from '../../../utils';

import ChangeUserTypeModal from './ChangeUserTypeModal';

/**
 * Note: This controller attaches to the accounts page, and submits account
 * changes to dashboard using a Rails-generated form.  It takes a jQuery
 * wrapper for that form as an argument to the constructor.
 *
 * On submit, this controller loads the relevant information into the form and
 * calls submit(). Rails injects all the JavaScript needed for the form to
 * submit via AJAX with all the appropriate validation tokens, etc.  The
 * controller subscribes to events emitted by the Rails helper JavaScript to
 * detect success or errors.
 *
 * Read more:
 * http://guides.rubyonrails.org/working_with_javascript_in_rails.html#rails-ujs-event-handlers
 * https://github.com/rails/jquery-ujs
 */
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
   */
  constructor(form, initialUserType) {
    this.form = form;
    this.initialUserType = initialUserType;
    this.dropdown = form.find('#change-user-type_user_user_type');
    this.button = form.find('#change-user-type-button');
    this.status = form.find('#change-user-type-status');

    // Attach handlers
    this.dropdown.change(e => this.onUserTypeDropdownChange(e.target.value));
    this.button.click(this.onChangeUserTypeButtonClick);

    // Set initial state
    this.onUserTypeDropdownChange(initialUserType);
  }

  /**
   * Enable or disable the submit button for changing user type based on
   * whether the selected user type is actually different than the user's
   * current type.
   * @param {string} selectedType
   */
  onUserTypeDropdownChange = selectedType => {
    this.button.prop('disabled', selectedType === this.initialUserType);
  };

  onChangeUserTypeButtonClick = e => {
    // Email confirmation is required when changing from a student account
    // to a teacher account.
    const needEmailConfirmation = this.dropdown.val() === 'teacher';
    if (needEmailConfirmation) {
      this.showChangeUserTypeModal();
    } else {
      // Must submit before disabling fields or they'll be omitted from the form.
      const promise = this.submitUserTypeChange({});
      this.dropdown.prop('disabled', true);
      this.button.prop('disabled', true);
      this.status.text(i18n.saving());
      // Note: this.submitPromise is exposed as a property for testing.
      this.submitPromise = promise.then(utils.reload).catch(err => {
        this.dropdown.prop('disabled', false);
        this.button.prop('disabled', false);
        this.status.text(i18n.changeUserTypeModal_unexpectedError());
      });
    }

    e.preventDefault();
  };

  showChangeUserTypeModal() {
    if (this.mountPoint) {
      return; // Idempotent show
    }

    const handleSubmit = values =>
      this.submitUserTypeChange(values).then(() => utils.reload());

    this.mountPoint = document.createElement('div');
    document.body.appendChild(this.mountPoint);
    ReactDOM.render(
      <ChangeUserTypeModal
        handleSubmit={handleSubmit}
        handleCancel={this.hideChangeUserTypeModal}
      />,
      this.mountPoint
    );
  }

  hideChangeUserTypeModal = () => {
    if (this.mountPoint) {
      ReactDOM.unmountComponentAtNode(this.mountPoint);
      document.body.removeChild(this.mountPoint);
      delete this.mountPoint;
    }
  };

  /**
   * Submit a user type change using the Rails-generated async form.
   * @param {string} email
   * @param {''|'yes'|'no'} emailOptIn
   * @return {Promise} which may reject with an error or object containing
   *   serverErrors.
   */
  submitUserTypeChange({email, emailOptIn}) {
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
              email:
                (validationErrors.email && validationErrors.email[0]) ||
                // TODO: (madelynkasula) The line below can be deleted once all users have been migrated.
                // We no longer have the requirement that the given email address must match an existing
                // email address upon changing user type.
                (validationErrors.current_password &&
                  i18n.changeUserTypeModal_email_mustMatch()),
            },
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
      this.form.find('#change-user-type_user_email').val(email);
      this.form
        .find('#change-user-type_user_email_preference_opt_in')
        .val(emailOptIn);
      this.form.submit();
    });
  }
}
