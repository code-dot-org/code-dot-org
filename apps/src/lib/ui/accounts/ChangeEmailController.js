import React from 'react';
import ReactDOM from 'react-dom';

import {hashEmail} from '../../../code-studio/hashEmail';
import color from '../../../util/color';

import ChangeEmailModal from './ChangeEmailModal';

/**
 * This controller submits email changes to dashboard using a hidden
 * Rails-generated form.  It expects a jQuery wrapper for that form to be
 * provided on construction.
 *
 * When the user submits an email change, this controller loads the relevant
 * information into the hidden Rails form and calls submit(). Rails injects
 * all the JavaScript needed for the form to submit via AJAX with all the
 * appropriate validation tokens, etc.  The controller subscribes to events
 * emitted by the Rails helper JavaScript to detect success or errors.
 *
 * Read more:
 * http://guides.rubyonrails.org/working_with_javascript_in_rails.html#rails-ujs-event-handlers
 * https://github.com/rails/jquery-ujs
 */
export default class ChangeEmailController {
  /**
   * @param {jQuery} form
   * @param {jQuery} link
   * @param {jQuery} displayedUserEmail
   * @param {number} userAge
   * @param {string} userType
   * @param {boolean} isPasswordRequired
   * @param {function(newEmail:string, newHashedEmail:string, emailOptIn:string)} emailChangedCallback
   */
  constructor({
    form,
    link,
    displayedUserEmail,
    userAge,
    userType,
    isPasswordRequired,
    emailChangedCallback,
  }) {
    this.form = form;
    this.displayedUserEmail = displayedUserEmail;
    this.userAge = userAge;
    this.userType = userType;
    this.isPasswordRequired = isPasswordRequired;
    this.emailChangedCallback = emailChangedCallback;
    link.click(this.showChangeEmailModal);
  }

  showChangeEmailModal = () => {
    if (this.mountPoint) {
      return; // Idempotent show
    }

    const userHashedEmail = this.form
      .find('#change-email-modal_user_hashed_email')
      .val();
    const handleSubmit = values =>
      this.submitEmailChange(values).then(this.onEmailChanged);

    this.mountPoint = document.createElement('div');
    document.body.appendChild(this.mountPoint);
    ReactDOM.render(
      <ChangeEmailModal
        handleSubmit={handleSubmit}
        handleCancel={this.hideChangeEmailModal}
        userType={this.userType}
        isPasswordRequired={this.isPasswordRequired}
        currentHashedEmail={userHashedEmail}
      />,
      this.mountPoint
    );
  };

  hideChangeEmailModal = () => {
    if (this.mountPoint) {
      ReactDOM.unmountComponentAtNode(this.mountPoint);
      document.body.removeChild(this.mountPoint);
      delete this.mountPoint;
    }
  };

  onEmailChanged = newEmail => {
    if ('teacher' === this.userType) {
      this.displayedUserEmail.text(newEmail);
    }
    this.hideChangeEmailModal();
    this.displayedUserEmail.effect('highlight', {
      duration: 1500,
      color: color.orange,
    });
    this.emailChangedCallback(newEmail, hashEmail(newEmail));
  };

  submitEmailChange({newEmail, currentPassword, emailOptIn}) {
    const newHashedEmail = hashEmail(newEmail);
    return new Promise((resolve, reject) => {
      const onSuccess = () => {
        detachHandlers();
        resolve(newEmail);
      };

      const onFailure = (_, xhr) => {
        const validationErrors = xhr.responseJSON;
        let error;
        if (validationErrors) {
          error = {
            serverErrors: {
              newEmail: validationErrors.email && validationErrors.email[0],
              currentPassword:
                validationErrors.current_password &&
                validationErrors.current_password[0],
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
      this.form
        .find('#change-email-modal_user_email')
        .val(this.userAge < 13 ? '' : newEmail);
      this.form
        .find('#change-email-modal_user_hashed_email')
        .val(newHashedEmail);
      this.form
        .find('#change-email-modal_user_email_preference_opt_in')
        .val(emailOptIn);
      this.form
        .find('#change-email-modal_user_current_password')
        .val(currentPassword);
      this.form.submit();
    });
  }
}
