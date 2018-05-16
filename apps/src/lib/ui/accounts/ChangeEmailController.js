import React from 'react';
import ReactDOM from "react-dom";
import color from '../../../util/color';
import ChangeEmailModal from '../ChangeEmailModal';
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
   *
   * @param {jQuery} form
   * @param {function(newEmail:string, newHashedEmail:string)} emailChangedCallback
   */
  constructor(form, emailChangedCallback) {
    this.form = form;
    this.emailChangedCallback = emailChangedCallback;
    $('#edit-email-link').click(this.showChangeEmailModal);
  }

  showChangeEmailModal = () => {
    const userAge = parseInt(document.getElementById('user_age').value, 10);
    const userHashedEmail = this.form.find('#change-email-modal_user_hashed_email').val();
    this.changeEmailMountPoint = document.createElement('div');
    document.body.appendChild(this.changeEmailMountPoint);
    ReactDOM.render(
      <ChangeEmailModal
        handleSubmit={this.onEmailChanged}
        handleCancel={this.hideChangeEmailModal}
        railsForm={this.form[0]}
        userAge={userAge}
        currentHashedEmail={userHashedEmail}
      />,
      this.changeEmailMountPoint
    );
  };

  hideChangeEmailModal = () => {
    ReactDOM.unmountComponentAtNode(this.changeEmailMountPoint);
    document.body.removeChild(this.changeEmailMountPoint);
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

}
