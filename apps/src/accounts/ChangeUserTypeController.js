import React from 'react';
import ReactDOM from 'react-dom';

import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import i18n from '@cdo/locale';

import * as utils from '../utils';

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
  }

  /**
   * Called by the React ChangeUserTypeSection when the user confirms a new
   * account type. Sets the hidden user_type field, then either opens the
   * email-confirmation modal (when upgrading to teacher) or submits directly.
   *
   * @param {string} selectedType
   * @return {Promise|undefined} a submission Promise for the direct-submit
   *   (teacher->student) path, so the section can show saving/error state;
   *   undefined when the modal is opened instead.
   */
  handleConfirm = selectedType => {
    this.form.find('#change-user-type_user_user_type').val(selectedType);

    // Email confirmation is required when changing to a teacher account.
    if (selectedType === 'teacher') {
      this.showChangeUserTypeModal();
      return undefined;
    }
    return this.submitUserTypeChange({});
  };

  showChangeUserTypeModal() {
    if (this.mountPoint) {
      return; // Idempotent show
    }
    this.mountPoint = document.createElement('div');
    document.body.appendChild(this.mountPoint);
    createReactRoot(
      <ChangeUserTypeModal
        handleSubmit={this.submitUserTypeChange}
        handleCancel={this.hideChangeUserTypeModal}
      />,
      this.mountPoint,
      {
        legacyReactDomRender: true,
      }
    );
  }

  hideChangeUserTypeModal = () => {
    if (this.mountPoint) {
      ReactDOM.unmountComponentAtNode(this.mountPoint);
      document.body.removeChild(this.mountPoint);
      delete this.mountPoint;
    }
  };

  handleSuccess = () => {
    const params = new URLSearchParams(window.location.search);
    const userReturnTo = params.get('user_return_to');
    // only allow relative urls to prevent open redirect
    if (userReturnTo && userReturnTo.startsWith('/')) {
      window.location.href = userReturnTo;
    } else {
      utils.reload();
    }
  };

  /**
   * Submit a user type change using the Rails-generated async form.
   * @param {string} email
   * @param {''|'yes'|'no'} emailOptIn
   * @return {Promise} which may reject with an error or object containing
   *   serverErrors.
   */
  submitUserTypeChange = ({email, emailOptIn}) => {
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
    }).then(this.handleSuccess);
  };
}
