import $ from 'jquery';
import ChangeEmailController from '@cdo/apps/lib/ui/accounts/ChangeEmailController';
import ChangeUserTypeController from '@cdo/apps/lib/ui/accounts/ChangeUserTypeController';
import getScriptData from '@cdo/apps/util/getScriptData';

const scriptData = getScriptData('edit');
const initialUserType = scriptData.userType;
const isOauth = scriptData.isOauth;

$(document).ready(() => {
  new ChangeEmailController({
    form: $('#change-email-modal-form'),
    link: $('#edit-email-link'),
    displayedUserEmail: $('#displayed-user-email'),
    userAge: $('#user_age'),
    emailChangedCallback: onEmailChanged,
  });

  new ChangeUserTypeController(
    $('#change-user-type-modal-form'),
    initialUserType,
    isOauth,
  );

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
