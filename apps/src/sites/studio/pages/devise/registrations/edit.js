import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import AddParentEmailController from '@cdo/apps/lib/ui/accounts/AddParentEmailController';
import AddPasswordController from '@cdo/apps/lib/ui/accounts/AddPasswordController';
import ChangeEmailController from '@cdo/apps/lib/ui/accounts/ChangeEmailController';
import ChangeUserTypeController from '@cdo/apps/lib/ui/accounts/ChangeUserTypeController';
import DeleteAccount from '@cdo/apps/lib/ui/accounts/DeleteAccount';
import LtiRosterSyncSettings from '@cdo/apps/lib/ui/accounts/LtiRosterSyncSettings';
import ManageLinkedAccountsController from '@cdo/apps/lib/ui/accounts/ManageLinkedAccountsController';
import MigrateToMultiAuth from '@cdo/apps/lib/ui/accounts/MigrateToMultiAuth';
import RemoveParentEmailController from '@cdo/apps/lib/ui/accounts/RemoveParentEmailController';
import {EVENTS, PLATFORMS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {getStore} from '@cdo/apps/redux';
import LockoutLinkedAccounts from '@cdo/apps/templates/policy_compliance/LockoutLinkedAccounts';
import color from '@cdo/apps/util/color';
import getScriptData from '@cdo/apps/util/getScriptData';

// Values loaded from scriptData are always initial values, not the latest
// (possibly unsaved) user-edited values on the form.
const scriptData = getScriptData('edit');
const {
  userAge,
  userType,
  isAdmin,
  isPasswordRequired,
  authenticationOptions,
  isGoogleClassroomStudent,
  isCleverStudent,
  dependedUponForLogin,
  dependentStudentsCount,
  personalAccountLinkingEnabled,
  lmsName,
} = scriptData;

$(document).ready(() => {
  const migrateMultiAuthMountPoint =
    document.getElementById('migrate-multi-auth');
  if (migrateMultiAuthMountPoint) {
    const store = getStore();
    ReactDOM.render(
      <Provider store={store}>
        <MigrateToMultiAuth />
      </Provider>,
      migrateMultiAuthMountPoint
    );
  }

  const updateDisplayedParentEmail = parentEmail => {
    const displayedParentEmail = $('#displayed-parent-email');
    displayedParentEmail.text(parentEmail);
    displayedParentEmail.effect('highlight', {
      duration: 1500,
      color: color.orange,
    });
  };
  new AddParentEmailController({
    form: $('#add-parent-email-modal-form'),
    formParentEmailField: $('#add-parent-email-modal_user_parent_email'),
    formParentOptInField: $(
      '#add-parent-email-modal_user_parent_email_preference_opt_in'
    ),
    link: $('#add-parent-email-link'),
    onSuccessCallback: updateDisplayedParentEmail,
  });
  new RemoveParentEmailController({
    form: $('#remove-parent-email-form'),
    link: $('#remove-parent-email-link'),
  });
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

  const ltiSyncSettingsMountPoint =
    document.getElementById('lti-sync-settings');
  if (ltiSyncSettingsMountPoint) {
    ReactDOM.render(
      <LtiRosterSyncSettings
        ltiRosterSyncEnabled={
          ltiSyncSettingsMountPoint.getAttribute(
            'data-lti-roster-sync-enabled'
          ) === 'true'
        }
        formId={'lti-sync-settings-form'}
        lmsName={lmsName}
      />,
      ltiSyncSettingsMountPoint
    );
  }

  const lockoutLinkedAccountsMountPoint = document.getElementById(
    'lockout-linked-accounts'
  );
  if (lockoutLinkedAccountsMountPoint) {
    ReactDOM.render(
      <LockoutLinkedAccounts
        pendingEmail={lockoutLinkedAccountsMountPoint.getAttribute(
          'data-pending-email'
        )}
        requestDate={
          new Date(
            Date.parse(
              lockoutLinkedAccountsMountPoint.getAttribute('data-request-date')
            )
          )
        }
        permissionStatus={lockoutLinkedAccountsMountPoint.getAttribute(
          'data-permission-status'
        )}
        userEmail={lockoutLinkedAccountsMountPoint.getAttribute(
          'data-user-email'
        )}
        inSection={JSON.parse(
          lockoutLinkedAccountsMountPoint.getAttribute('data-in-section')
        )}
        providers={JSON.parse(
          lockoutLinkedAccountsMountPoint.getAttribute('data-providers')
        )}
      />,
      lockoutLinkedAccountsMountPoint
    );
  }

  const manageLinkedAccountsMountPoint = document.getElementById(
    'manage-linked-accounts'
  );
  if (manageLinkedAccountsMountPoint) {
    new ManageLinkedAccountsController(
      manageLinkedAccountsMountPoint,
      authenticationOptions,
      isPasswordRequired,
      isGoogleClassroomStudent,
      isCleverStudent,
      personalAccountLinkingEnabled
    );
  }

  const deleteAccountMountPoint = document.getElementById('delete-account');
  if (deleteAccountMountPoint) {
    ReactDOM.render(
      <DeleteAccount
        isPasswordRequired={isPasswordRequired}
        isTeacher={userType === 'teacher'}
        dependedUponForLogin={dependedUponForLogin}
        dependentStudentsCount={dependentStudentsCount}
        hasStudents={dependentStudentsCount > 0}
        isAdmin={isAdmin}
      />,
      deleteAccountMountPoint
    );
  }

  analyticsReporter.sendEvent(
    EVENTS.ACCOUNT_SETTINGS_PAGE_VISITED,
    {'user type': userType},
    PLATFORMS.BOTH
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
  $('#edit_user_create_personal_account').on('submit', function (e) {
    if ($('#create_personal_user_email').length) {
      window.dashboard.hashEmail({
        email_selector: '#create_personal_user_email',
        hashed_email_selector: '#create_personal_user_hashed_email',
        age_selector: '#user_age',
      });
    }
  });
}
