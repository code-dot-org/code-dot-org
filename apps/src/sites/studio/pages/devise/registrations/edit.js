import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {getStore} from '@cdo/apps/redux';
import MigrateToMultiAuth from '@cdo/apps/lib/ui/accounts/MigrateToMultiAuth';
import ChangeEmailController from '@cdo/apps/lib/ui/accounts/ChangeEmailController';
import AddPasswordController from '@cdo/apps/lib/ui/accounts/AddPasswordController';
import ChangeUserTypeController from '@cdo/apps/lib/ui/accounts/ChangeUserTypeController';
import ManageLinkedAccountsController from '@cdo/apps/lib/ui/accounts/ManageLinkedAccountsController';
import DeleteAccount from '@cdo/apps/lib/ui/accounts/DeleteAccount';
import getScriptData from '@cdo/apps/util/getScriptData';

// Values loaded from scriptData are always initial values, not the latest
// (possibly unsaved) user-edited values on the form.
const scriptData = getScriptData('edit');
const {
  userAge,
  userType,
  isPasswordRequired,
  authenticationOptions,
  isGoogleClassroomStudent,
  isCleverStudent,
  dependedUponForLogin,
  dependentStudents,
  studentCount,
} = scriptData;

$(document).ready(() => {
  const migrateMultiAuthMountPoint = document.getElementById('migrate-multi-auth');
  if (migrateMultiAuthMountPoint) {
    const store = getStore();
    ReactDOM.render(
      <Provider store={store}>
        <MigrateToMultiAuth/>
      </Provider>,
      migrateMultiAuthMountPoint
    );
  }

  new ChangeEmailController({
    form: $('#change-email-modal-form'),
    link: $('#edit-email-link'),
    displayedUserEmail: $('#displayed-user-email'),
    userAge,
    userType,
    isPasswordRequired,
    emailChangedCallback: onEmailChanged,
  });

  new ChangeUserTypeController($('#change-user-type-modal-form'), userType);

  const addPasswordMountPoint = document.getElementById('add-password-fields');
  if (addPasswordMountPoint) {
    new AddPasswordController($('#add-password-form'), addPasswordMountPoint);
  }

  const manageLinkedAccountsMountPoint = document.getElementById('manage-linked-accounts');
  if (manageLinkedAccountsMountPoint) {
    new ManageLinkedAccountsController(
      manageLinkedAccountsMountPoint,
      authenticationOptions,
      isPasswordRequired,
      isGoogleClassroomStudent,
      isCleverStudent,
    );
  }

  const deleteAccountMountPoint = document.getElementById('delete-account');
  if (deleteAccountMountPoint) {
    ReactDOM.render(
      <DeleteAccount
        isPasswordRequired={isPasswordRequired}
        isTeacher={userType === 'teacher'}
        dependedUponForLogin={dependedUponForLogin}
        dependentStudents={dependentStudents}
        hasStudents={studentCount > 0}
      />,
      deleteAccountMountPoint
    );
  }

  initializeCreatePersonalAccountControls();
});

function onEmailChanged(newEmail, newHashedEmail) {
  $('#user_hashed_email').val(newHashedEmail);
  $('#change-user-type_user_email').val(newEmail);
  $('#change-user-type_user_hashed_email').val(newHashedEmail);
  $('#change-email-modal_user_email').val(newEmail);
  $('#change-email-modal_user_hashed_email').val(newHashedEmail);
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
