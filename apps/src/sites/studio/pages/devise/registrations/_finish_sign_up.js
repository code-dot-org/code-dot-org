import $ from 'jquery';
import i18n from "@cdo/locale";
import React from 'react';
import ReactDOM from 'react-dom';
import SchoolInfoInputs from '@cdo/apps/templates/SchoolInfoInputs';
import getScriptData from '@cdo/apps/util/getScriptData';
import firehoseClient from "@cdo/apps/lib/util/firehose";

const TEACHER_ONLY_FIELDS = ["#teacher-name-label", "#school-info-inputs", "#email-preference-radio"];
const STUDENT_ONLY_FIELDS = ["#student-name-label", "#gender-dropdown", "#age-dropdown", "#student-consent"];

// Values loaded from scriptData are always initial values, not the latest
// (possibly unsaved) user-edited values on the form.
const scriptData = getScriptData('signup');
const {usIp, signUpUID} = scriptData;

// Auto-fill country and countryCode if we detect a US IP address.
let schoolData = {
  country: usIp ? 'United States' : '',
  countryCode: usIp ? 'US' : '',
};

$(document).ready(() => {
  const schoolInfoMountPoint = document.getElementById("school-info-inputs");
  init();

  function init() {
    const userType = $("#user_user_type")[0].value;
    setUserType(userType);
    renderSchoolInfo();
  }

  $(".finish-signup").submit(function () {
    // The country set in our form is the long-form string name of the country.
    // We want it to be the 2-letter country code, so we change the value on form submission.
    const countryInputEl = $('input[name="user[school_info_attributes][country]"]');
    countryInputEl.val(schoolData.countryCode);
  });

  $("#user_user_type").change(function () {
    var value = $(this).val();
    setUserType(value);
  });

  function setUserType(userType) {
    if (userType) {
      trackUserType(userType);
    }

    switch (userType) {
      case "teacher":
        switchToTeacher();
        break;
      default:
        // Show student fields by default.
        switchToStudent();
    }
  }

  function switchToTeacher() {
    fadeInFields(TEACHER_ONLY_FIELDS);
    hideFields(STUDENT_ONLY_FIELDS);
  }

  function switchToStudent() {
    fadeInFields(STUDENT_ONLY_FIELDS);
    hideFields(TEACHER_ONLY_FIELDS);
  }

  function trackUserType(type) {
    firehoseClient.putRecord({
      study: 'account-sign-up-v2',
      study_group: 'experiment-v2',
      event: 'select-' + type,
      data_string: signUpUID,
    });
  }

  function fadeInFields(fields) {
    $(fields.join(', ')).fadeIn();
  }

  function hideFields(fields) {
    $(fields.join(', ')).hide();
  }

  function renderSchoolInfo() {
    if (schoolInfoMountPoint) {
      ReactDOM.render(
        <div style={{padding: 10}}>
          <h5>{i18n.schoolInformationHeader()}</h5>
          <hr/>
          <SchoolInfoInputs
            schoolType={schoolData.schoolType}
            country={schoolData.country}
            ncesSchoolId={schoolData.ncesSchoolId}
            schoolName={schoolData.schoolName}
            schoolCity={schoolData.schoolCity}
            schoolState={schoolData.schoolState}
            schoolZip={schoolData.schoolZip}
            schoolLocation={schoolData.schoolLocation}
            useGoogleLocationSearch={schoolData.useGoogleLocationSearch}
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
        [field]: event.target.value
      };
    }
    renderSchoolInfo();
  }
});
