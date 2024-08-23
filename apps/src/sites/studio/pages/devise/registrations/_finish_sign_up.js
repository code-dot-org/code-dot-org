import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import {EVENTS, PLATFORMS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import harness from '@cdo/apps/lib/util/harness';
import SchoolDataInputs from '@cdo/apps/templates/SchoolDataInputs';
import {
  SELECT_A_SCHOOL,
  CLICK_TO_ADD,
  NO_SCHOOL_SETTING,
} from '@cdo/apps/templates/SchoolZipSearch';
import experiments from '@cdo/apps/util/experiments';
import getScriptData from '@cdo/apps/util/getScriptData';

const TEACHER_ONLY_FIELDS = [
  '#teacher-name-label',
  '#school-info-section',
  '#email-preference-radio',
  '#teacher-gdpr',
];
const STUDENT_ONLY_FIELDS = [
  '#student-name-label',
  '#gender-field',
  '#age-dropdown',
  '#us-state-dropdown',
  '#student-consent',
  '#parent-email-container',
  '#student-gdpr',
];

// Values loaded from scriptData are always initial values, not the latest
// (possibly unsaved) user-edited values on the form.
const scriptData = getScriptData('signup');
const {usIp, signUpUID} = scriptData;

// User type buttons
const teacherButton = document.getElementById('select-user-type-teacher');
const studentButton = document.getElementById('select-user-type-student');

let userInRegionalPartnerVariant = experiments.isEnabled(
  experiments.OPT_IN_EMAIL_REG_PARTNER
);

$(document).ready(() => {
  const schoolInfoMountPoint = document.getElementById('school-info-inputs');
  let user_type = $('#user_user_type').val();
  init();

  function init() {
    let hiddenUserType = $('#user_user_type').attr('type') === 'hidden';
    if (!hiddenUserType) {
      document.getElementById('select-user-type-original').style.cssText =
        'display:none;';
      document.getElementById('select-user-type-variant').style.cssText =
        'display:flex;';
      document.getElementById('signup-select-user-type-label').style.cssText =
        'width:135px;';
    }
    setUserType(user_type);
    renderParentSignUpSection();
  }

  let alreadySubmitted = false;
  $('.finish-signup').submit(function () {
    // prevent multiple submission. We want to do this to defend against
    // attempting to create multiple accounts, and it's valid to simply disable
    // after the first attempt here since this form is submitted via HTML and
    // will therefore initiate a page load after submission.
    if (alreadySubmitted) {
      return false;
    }

    alreadySubmitted = true;
    // Clean up school data and set age for teachers.
    let has_school = false;
    let has_marketing_value = false;
    const has_display_name = $('input[name="user[name]"]')?.val() !== '';
    if (user_type === 'teacher') {
      cleanSchoolInfo();
      $('#user_age').val('21+');
      // If the school association flow has a school, update to true
      if ($('select[name="user[school_info_attributes][school_id]"]')?.val()) {
        has_school = true;
      }
      // Check if either of the marketing opt in/out radio buttons are selected
      if (
        $('input[id="user_email_preference_opt_in_yes"]')?.is(':checked') ||
        $('input[id="user_email_preference_opt_in_no"]')?.is(':checked')
      ) {
        has_marketing_value = true;
      }
    }
    analyticsReporter.sendEvent(
      EVENTS.SIGN_UP_FINISHED_EVENT,
      {
        'user type': user_type,
        'has school': has_school,
        'has marketing value selected': has_marketing_value,
        'has display name': has_display_name,
      },
      PLATFORMS.BOTH
    );
  });

  function cleanSchoolInfo() {
    // Clear school_id and zip if the searched school is not found.
    const newSchoolIdEl = $(
      'select[name="user[school_info_attributes][school_id]"]'
    );
    if (
      [NO_SCHOOL_SETTING, CLICK_TO_ADD, SELECT_A_SCHOOL].includes(
        newSchoolIdEl.val()
      )
    ) {
      newSchoolIdEl.val('');
      $('input[name="user[school_info_attributes][school_zip]"]').val('');
    }
  }

  $('#user_parent_email_preference_opt_in_required').change(function () {
    // If the user_type is currently blank, switch the user_type to 'student' because that is the only user_type which
    // allows the parent sign up section of the form.
    if (user_type === '') {
      setUserType('student');
      $('#user_user_type').val('student').change();
    }
    renderParentSignUpSection();
  });

  function renderParentSignUpSection() {
    let checked = $('#user_parent_email_preference_opt_in_required').is(
      ':checked'
    );
    if (checked) {
      fadeInFields(['.parent-email-field']);
    } else {
      hideFields(['.parent-email-field']);
    }
  }

  // Keep if sign-up user type experiment favors original (just func. below)
  $('#user_user_type').change(function () {
    var value = $(this).val();
    setUserType(value);
  });
  // Event listeners for changing the user type
  document.addEventListener('selectUserTypeTeacher', e => {
    $('#user_user_type').val('teacher');
    setUserType('teacher');
  });
  document.addEventListener('selectUserTypeStudent', e => {
    $('#user_user_type').val('student');
    setUserType('student');
  });

  function setUserType(new_user_type) {
    if (new_user_type) {
      trackUserType(new_user_type);
    }
    // Switch to new user type
    if (new_user_type === 'teacher') {
      switchToTeacher();
    } else {
      // Show student fields by default.
      switchToStudent();
    }
    styleSelectedUserTypeButton(new_user_type);
    user_type = new_user_type;
  }

  // Style selected user type button to show it has been clicked
  function styleSelectedUserTypeButton(value) {
    // For LTI, the user type is implied from the LMS so the buttons will not appear
    if (!teacherButton || !studentButton) {
      return;
    }

    if (value === 'teacher') {
      teacherButton.classList.add('select-user-type-button-selected');
      studentButton.classList.remove('select-user-type-button-selected');
    } else if (value === 'student') {
      studentButton.classList.add('select-user-type-button-selected');
      teacherButton.classList.remove('select-user-type-button-selected');
    }
  }

  function switchToTeacher() {
    fadeInFields(TEACHER_ONLY_FIELDS);
    hideFields(STUDENT_ONLY_FIELDS);
    toggleVisShareEmailRegPartner(usIp);
    renderSchoolInfo();
  }

  function switchToStudent() {
    fadeInFields(STUDENT_ONLY_FIELDS);
    hideFields(TEACHER_ONLY_FIELDS);
    toggleVisShareEmailRegPartner(false);
  }

  function trackUserType(type) {
    harness.trackAnalytics({
      study: 'account-sign-up-v5',
      study_group: 'experiment-v4',
      event: 'select-' + type,
      data_string: signUpUID,
    });
    analyticsReporter.sendEvent(
      EVENTS.ACCOUNT_TYPE_PICKED_EVENT,
      {
        'account type': type,
      },
      PLATFORMS.BOTH
    );
  }

  function fadeInFields(fields) {
    $(fields.join(', ')).fadeIn();
  }

  function hideFields(fields) {
    $(fields.join(', ')).hide();
  }

  // Show opt-in for teachers in the U.S. for sharing their email with
  // Code.org regional partners.
  function toggleVisShareEmailRegPartner(isTeacherInUnitedStates) {
    if (userInRegionalPartnerVariant && isTeacherInUnitedStates) {
      $('#share-email-reg-part-preference-radio').fadeIn();
    } else {
      $('#share-email-reg-part-preference-radio').hide();
    }
  }

  function renderSchoolInfo() {
    if (schoolInfoMountPoint) {
      ReactDOM.render(
        <div style={{padding: 22}}>
          <SchoolDataInputs usIp={usIp} />
        </div>,
        schoolInfoMountPoint
      );
    }
  }
});
