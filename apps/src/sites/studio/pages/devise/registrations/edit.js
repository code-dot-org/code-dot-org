import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import ConfirmEmailModal from '@cdo/apps/code-studio/ConfirmEmailModal';
import ChangeEmailModal from '@cdo/apps/lib/ui/ChangeEmailModal';
import getScriptData from '@cdo/apps/util/getScriptData';
import color from '@cdo/apps/util/color';

const scriptData = getScriptData('edit');
const initialUserType = scriptData.userType;
const isOauth = scriptData.isOauth;
let emailModalConfirmed = false;

const confirmEmailDiv = $('<div>');
function showConfirmEmailModal(cancel, submit) {
  $(document.body).append(confirmEmailDiv);

  ReactDOM.render(
    <ConfirmEmailModal
      isOpen={true}
      handleCancel={cancel}
      handleSubmit={submit}
    />,
    confirmEmailDiv[0]
  );
}

function closeConfirmEmailModal() {
  ReactDOM.unmountComponentAtNode(confirmEmailDiv[0]);
}

function prepareEmailData() {
  window.dashboard.hashEmail({
    email_selector: '#user_email',
    hashed_email_selector: '#user_hashed_email',
    age_selector: '#user_age'
  });
}

function onCancelModal() {
  $("#user_user_type").val("student");
  closeConfirmEmailModal();
}

function onSubmitModal(e) {
  return email => {
    $("#user_email").val(email);
    // Retrigger the submit with a flag marking the modal as completed
    emailModalConfirmed = true;
    $(e.currentTarget).trigger('click');
    closeConfirmEmailModal();
  };
}

const changeEmailMountPoint = document.createElement('div');
function showChangeEmailModal() {
  document.body.appendChild(changeEmailMountPoint);
  const form = document.getElementById('change-email-modal-form');
  const userAge = parseInt(document.getElementById('user_age').value, 10);
  const userHashedEmail = document.getElementById('change-email-modal-hashed-email').value;
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

$(document).ready(() => {
  $( "#submit-update").find("input").on("click", function (e) {
    const userType = $('#user_user_type')[0].value;
    let needToConfirmEmail = !emailModalConfirmed
      && isOauth
      && userType !== initialUserType
      && userType === "teacher"
    ;
    if (needToConfirmEmail) {
      e.preventDefault();
      showConfirmEmailModal(onCancelModal, onSubmitModal(e));
    } else if ($('#user_email').length) {
      prepareEmailData();
    }
  });
  $( "#edit_user_create_personal_account" ).on("submit", function (e) {
    if ($('#create_personal_user_email').length) {
      window.dashboard.hashEmail({
        email_selector: '#create_personal_user_email',
        hashed_email_selector: '#create_personal_user_hashed_email',
        age_selector: '#user_age'
      });
    }
  });

  $('#edit-email-link').click(showChangeEmailModal);
});
