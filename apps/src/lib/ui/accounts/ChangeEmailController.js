import React from 'react';
import ReactDOM from "react-dom";
import color from '../../../util/color';
import ChangeEmailModal from './ChangeEmailModal';
import {hashEmail} from '../../../code-studio/hashEmail';

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
   * @param {function(newEmail:string, newHashedEmail:string)} emailChangedCallback
   */
  constructor(form, emailChangedCallback) {
    this.form = form;
    this.emailChangedCallback = emailChangedCallback;
    $('#edit-email-link').click(this.showChangeEmailModal);
  }

  showChangeEmailModal = () => {
    const userHashedEmail = this.form.find('#change-email-modal_user_hashed_email').val();
    const handleSubmit = (values) => (
      this.submitEmailChange(values)
        .then(this.onEmailChanged)
    );

    this.mountPoint = document.createElement('div');
    document.body.appendChild(this.mountPoint);
    ReactDOM.render(
      <ChangeEmailModal
        handleSubmit={handleSubmit}
        handleCancel={this.hideChangeEmailModal}
        currentHashedEmail={userHashedEmail}
      />,
      this.mountPoint
    );
  };

  hideChangeEmailModal = () => {
    ReactDOM.unmountComponentAtNode(this.mountPoint);
    document.body.removeChild(this.mountPoint);
  };

  onEmailChanged = (newEmail) => {
    const displayedUserEmail = $('#displayed-user-email');
    if ('***encrypted***' !== displayedUserEmail.text()) {
      displayedUserEmail.text(newEmail);
    }
    this.hideChangeEmailModal();
    $(displayedUserEmail).effect('highlight', {
      duration: 1500,
      color: color.orange,
    });
    this.emailChangedCallback(newEmail, hashEmail(newEmail));
  };

  submitEmailChange({newEmail, currentPassword}) {
    const newHashedEmail = hashEmail(newEmail);
    const userAge = parseInt(document.getElementById('user_age').value, 10);
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
      this.form.find('#change-email-modal_user_email').val(userAge < 13 ? '' : newEmail);
      this.form.find('#change-email-modal_user_hashed_email').val(newHashedEmail);
      this.form.find('#change-email-modal_user_current_password').val(currentPassword);
      this.form.submit();
    });
  }
}
