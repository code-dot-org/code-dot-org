import $ from 'jquery';
import ChangeEmailController from '@cdo/apps/lib/ui/accounts/ChangeEmailController';
import AddPasswordController from '@cdo/apps/lib/ui/accounts/AddPasswordController';
import ChangeUserTypeController from '@cdo/apps/lib/ui/accounts/ChangeUserTypeController';
import ManageLinkedAccountsController from '@cdo/apps/lib/ui/accounts/ManageLinkedAccountsController';
import getScriptData from '@cdo/apps/util/getScriptData';

// Values loaded from scriptData are always initial values, not the latest
// (possibly unsaved) user-edited values on the form.
const scriptData = getScriptData('edit');
const {userAge, userType, isPasswordRequired} = scriptData;

$(document).ready(() => {
  new ChangeEmailController({
    form: $('#change-email-modal-form'),
    link: $('#edit-email-link'),
    displayedUserEmail: $('#displayed-user-email'),
    userAge,
    userType,
    isPasswordRequired,
    emailChangedCallback: onEmailChanged,
  });

  new ChangeUserTypeController(
    $('#change-user-type-modal-form'),
    userType,
  );

  const addPasswordMountPoint = document.getElementById('add-password-fields');
  if (addPasswordMountPoint) {
    new AddPasswordController($('#add-password-form'), addPasswordMountPoint);
  }


  const manageLinkedAccountsMountPoint = document.getElementById('manage-linked-accounts');
  if (manageLinkedAccountsMountPoint) {
    new ManageLinkedAccountsController(manageLinkedAccountsMountPoint);
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
