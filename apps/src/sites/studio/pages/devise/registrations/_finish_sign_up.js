import $ from 'jquery';
import i18n from '@cdo/locale';
import React from 'react';
import ReactDOM from 'react-dom';
import SchoolInfoInputs from '@cdo/apps/templates/SchoolInfoInputs';
import getScriptData from '@cdo/apps/util/getScriptData';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import experiments from '@cdo/apps/util/experiments';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';

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

// Auto-fill country and countryCode if we detect a US IP address.
let schoolData = {
  country: usIp ? 'United States' : '',
  countryCode: usIp ? 'US' : '',
};

// Keep track of whether the current user is in the U.S. or not (for regional partner email sharing)
let isInUnitedStates = schoolData.countryCode === 'US';

// Track whether clearer user type buttons rollout is enabled
const inClearerUserTypeRollout = experiments.isEnabled(
  experiments.CLEARER_SIGN_UP_USER_TYPE
);

let userInRegionalPartnerVariant = experiments.isEnabled(
  experiments.OPT_IN_EMAIL_REG_PARTNER
);

$(document).ready(() => {
  const schoolInfoMountPoint = document.getElementById('school-info-inputs');
  let user_type = $('#user_user_type').val();
  init();

  function init() {
    if (inClearerUserTypeRollout) {
      // If in variant, toggle large buttons
      document.getElementById('select-user-type-original').style.cssText =
        'display:none;';
      document.getElementById('select-user-type-variant').style.cssText =
        'display:flex;';
      document.getElementById('signup-select-user-type-label').style.cssText =
        'width:135px;';
    } else {
      // Otherwise (also the default), keep original dropdown
      document.getElementById('select-user-type-variant').style.cssText =
        'display:none;';
      document.getElementById('select-user-type-original').style.cssText =
        'display:flex;';
      document.getElementById('signup-select-user-type-label').style.cssText =
        'width:220px;';
    }
    setUserType(user_type);
    renderSchoolInfo();
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
    if (user_type === 'teacher') {
      cleanSchoolInfo();
      $('#user_age').val('21+');
    }
    analyticsReporter.sendEvent(EVENTS.SIGN_UP_FINISHED_EVENT);
  });

  function cleanSchoolInfo() {
    // The country set in our form is the long-form string name of the country.
    // We want it to be the 2-letter country code, so we change the value on form submission.
    const countryInputEl = $(
      'input[name="user[school_info_attributes][country]"]'
    );
    countryInputEl.val(schoolData.countryCode);

    // Clear school_id if the searched school is not found.
    if (schoolData.ncesSchoolId === '-1') {
      const schoolIdEl = $(
        'input[name="user[school_info_attributes][school_id]"]'
      );
      schoolIdEl.val('');
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
    if (inClearerUserTypeRollout) {
      styleSelectedUserTypeButton(new_user_type);
    }
    user_type = new_user_type;
  }

  // Style selected user type button to show it has been clicked
  function styleSelectedUserTypeButton(value) {
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
    toggleVisShareEmailRegPartner(isInUnitedStates);
  }

  function switchToStudent() {
    fadeInFields(STUDENT_ONLY_FIELDS);
    hideFields(TEACHER_ONLY_FIELDS);
    toggleVisShareEmailRegPartner(false);
  }

  function trackUserType(type) {
    firehoseClient.putRecord({
      study: 'account-sign-up-v5',
      study_group: 'experiment-v4',
      event: 'select-' + type,
      data_string: signUpUID,
    });
    analyticsReporter.sendEvent(EVENTS.ACCOUNT_TYPE_PICKED_EVENT, {
      'account type': type,
    });
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
        <div style={{padding: 10}}>
          <h5>{i18n.schoolInformationHeader()}</h5>
          <hr />
          <SchoolInfoInputs
            schoolType={schoolData.schoolType}
            country={schoolData.country}
            ncesSchoolId={schoolData.ncesSchoolId}
            schoolName={schoolData.schoolName}
            schoolCity={schoolData.schoolCity}
            schoolState={schoolData.schoolState}
            schoolZip={schoolData.schoolZip}
            schoolLocation={schoolData.schoolLocation}
            useLocationSearch={schoolData.useLocationSearch}
            onCountryChange={onCountryChange}
            onSchoolTypeChange={onSchoolTypeChange}
            onSchoolChange={onSchoolChange}
            onSchoolNotFoundChange={onSchoolNotFoundChange}
            showRequiredIndicator={false}
            styles={{width: 580}}
          />
        </div>,
        schoolInfoMountPoint
      );
    }
  }

  function onCountryChange(_, event) {
    if (event) {
      schoolData.country = event.value;
      schoolData.countryCode = event.label;
    }
    isInUnitedStates = schoolData.countryCode === 'US';
    toggleVisShareEmailRegPartner(isInUnitedStates);
    renderSchoolInfo();
  }

  function onSchoolTypeChange(event) {
    schoolData.schoolType = event ? event.target.value : '';
    renderSchoolInfo();
  }

  function onSchoolChange(_, event) {
    schoolData.ncesSchoolId = event ? event.value : '';
    renderSchoolInfo();
  }

  function onSchoolNotFoundChange(field, event) {
    if (event) {
      schoolData = {
        ...schoolData,
        [field]: event.target.value,
      };
    }
    renderSchoolInfo();
  }
});
