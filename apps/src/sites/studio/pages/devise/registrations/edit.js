import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import ChangeEmailModal from '@cdo/apps/lib/ui/ChangeEmailModal';
import ChangeUserTypeModal from '@cdo/apps/lib/ui/ChangeUserTypeModal';
import color from '@cdo/apps/util/color';
import getScriptData from '@cdo/apps/util/getScriptData';

const scriptData = getScriptData('edit');
const initialUserType = scriptData.userType;
const isOauth = scriptData.isOauth;

$(document).ready(() => {
  initializeChangeEmailControls();
  initializeChangeUserTypeControls(initialUserType, isOauth);
  initializeCreatePersonalAccountControls();
});

function initializeChangeEmailControls() {
  const changeEmailMountPoint = document.createElement('div');

  function showChangeEmailModal() {
    document.body.appendChild(changeEmailMountPoint);
    const form = document.getElementById('change-email-modal-form');
    const userAge = parseInt(document.getElementById('user_age').value, 10);
    const userHashedEmail = document.getElementById('change-email-modal_user_hashed_email').value;
    ReactDOM.render(
      <ChangeEmailModal
        isOpen
        handleSubmit={onEmailChanged}
        handleCancel={hideChangeEmailModal}
        railsForm={form}
        userAge={userAge}
        currentHashedEmail={userHashedEmail}
      />,
      changeEmailMountPoint
    );
  }

  function onEmailChanged(newEmail) {
    const displayedUserEmail = $('#displayed-user-email');
    if ('***encrypted***' !== displayedUserEmail.text()) {
      displayedUserEmail.text(newEmail);
    }
    hideChangeEmailModal();
    $(displayedUserEmail).effect('highlight', {
      duration: 1500,
      color: color.orange,
    });
  }

  function hideChangeEmailModal() {
    ReactDOM.unmountComponentAtNode(changeEmailMountPoint);
    document.body.removeChild(changeEmailMountPoint);
  }

  $('#edit-email-link').click(showChangeEmailModal);
}

/**
 * Attach handlers and behaviors for the part of the accounts page that
 * lets the user change their account type from student to teacher, or from
 * teacher to student.
 *
 * @param {!string} initialUserType
 */
function initializeChangeUserTypeControls(initialUserType, isOauth) {
  const changeUserTypeModalMountPoint = document.createElement('div');
  const form = $('#change-user-type-modal-form');
  const dropdown = form.find('#change-user-type_user_user_type');
  const button = form.find('#change-user-type-button');

  // Enable or disable the submit button for changing user type based on
  // whether the selected user type is actually different than the user's
  // current type.
  function onUserTypeDropdownChange(selectedType) {
    button.prop('disabled', selectedType === initialUserType);
  }

  function onUserTypeChangeButtonClick(e) {
    // Email confirmation is required when changing from a student account
    // to a teacher account.
    const needEmailConfirmation = dropdown.val() === 'teacher';
    // Confirm the user's password for this change, unless the user doesn't
    // have a password.
    const needPasswordConfirmation = !isOauth;

    if (needEmailConfirmation || needPasswordConfirmation) {
      showChangeUserTypeModal({needEmailConfirmation, needPasswordConfirmation});
    } else {
      // Submit form now?
    }

    e.preventDefault();
  }

  function showChangeUserTypeModal() {

    document.body.appendChild(changeUserTypeModalMountPoint);
    const targetUserType = dropdown.val();
    const userHashedEmail= document.getElementById('change-user-type_user_hashed_email').value;
    const handleSubmit = (values) => onSubmitUserTypeChange(values)
      // .then(hideChangeUserTypeModal)
      // .then(() => form.effect('highlight', {
      //   duration: 1500,
      //   color: color.orange,
      // }))
      .then(() => window.location.reload());

    ReactDOM.render(
      <ChangeUserTypeModal
        targetUserType={targetUserType}
        currentHashedEmail={userHashedEmail}
        handleSubmit={handleSubmit}
        handleCancel={hideChangeUserTypeModal}
      />,
      changeUserTypeModalMountPoint
    );
  }

  function hideChangeUserTypeModal() {
    ReactDOM.unmountComponentAtNode(changeUserTypeModalMountPoint);
    document.body.removeChild(changeUserTypeModalMountPoint);
  }

  /**
   * Submit a user type change using the Rails-generated async form.
   * @param {{currentEmail: string, currentPassword: string}} values
   * @return {Promise} which may reject with an error or object containing
   *   serverErrors.
   */
  function onSubmitUserTypeChange(values) {
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
        form.on('ajax:success', onSuccess);
        form.on('ajax:error', onFailure);
      };
      form.on('ajax:success', onSuccess);
      form.on('ajax:error', onFailure);
      form.find('#change-user-type_user_email').val(values.currentEmail);
      form.find('#change-user-type_user_current_password').val(values.currentPassword);
      form.submit();
    });
  }

  // Attach handlers
  dropdown.change(e => onUserTypeDropdownChange(e.target.value));
  button.click(onUserTypeChangeButtonClick);

  // Set initial state
  onUserTypeDropdownChange(initialUserType);
}

function initializeCreatePersonalAccountControls() {
  $( "#edit_user_create_personal_account" ).on("submit", function (e) {
    if ($('#create_personal_user_email').length) {
      window.dashboard.hashEmail({
        email_selector: '#create_personal_user_email',
        hashed_email_selector: '#create_personal_user_hashed_email',
        age_selector: '#user_age'
      });
    }
  });
}
