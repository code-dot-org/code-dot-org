/* globals google thanksUrl signupErrorMessage censusErrorMessage hocYear */

import React from 'react';
import ReactDOM from 'react-dom';
import SchoolAutocompleteDropdownWithLabel from '@cdo/apps/templates/census2017/SchoolAutocompleteDropdownWithLabel.jsx';

let schoolData = {
  nces: '',
  showDropdownError: false,
};


// SchoolAutocompleteDropdown sets the value to "-1" when the user selects "My school isn't listed"
const SCHOOL_NOT_FOUND = "-1";

function renderSchoolDropdown() {
  ReactDOM.render (
    <SchoolAutocompleteDropdownWithLabel
      setField={schoolDropdownOnChange}
      value={schoolData.nces}
      showErrorMsg={schoolData.showDropdownError}
    />,
    $('#school-selector')[0]
  );
}

function schoolDropdownOnChange(field, event) {
  const val = (event ? event.value : '');

  schoolData.nces = val;
  schoolData.showDropdownError = !val;

  if (val === SCHOOL_NOT_FOUND) {
    $('#school-name-field').show();
    $('#hoc-event-location-field').show();
  } else if (val) {
    $('#school-name-field').hide();
    $('#hoc-event-location-field').hide();
  }

  renderSchoolDropdown();
}

$(document).ready(function () {

  new google.maps.places.SearchBox(document.getElementById('hoc-event-location'));

  $('#hoc-signup-form select').selectize({
    plugins: ['fast_click']
  });

  renderSchoolDropdown();

  $("#hoc-signup-form").submit(function ( event ) {
    $('#email-invalid-error').hide();
    if (validateFields()) {
      signupFormSubmit(gotoThankYouPage);
    }
    renderSchoolDropdown();
  });

  $("#census-form").submit(function ( event ) {
    censusFormSubmit();
  });

  $('#continue').click(function () {
    $('#email-invalid-error').hide();
    if (validateFields()) {
      signupFormSubmit(showCensusForm);
    }
    renderSchoolDropdown();
  });

  $('#hoc-special-event-flag').change(function () {
    if ($(this).is(':checked')) {
      $('#hoc-special-event-details').closest('.form-group').slideDown();
    } else {
      $('#hoc-special-event-details').closest('.form-group').slideUp();
    }
  });

  function checkShowNameEventLocation() {
    // in-school & US
    if (($('#hoc-event-type').val() === 'in_school') && ($("#country").val() === 'US')) {
      $('#school-autocomplete').show();
      if (schoolData.nces === SCHOOL_NOT_FOUND) {
        $('#school-name-field').show();
        $('#hoc-event-location-field').show();
      } else {
        $('#school-name-field').hide();
        $('#hoc-event-location-field').hide();
      }
      $('#organization-name-field').hide();
      $('#hoc-entire-school').show();
      // continue button goes to census questions on click
      $('#continue-btn').show();
      $('#submit-btn').hide();
    } else if (($('#hoc-event-type').val() === 'in_school')) {
      // in-school & NOT US
      $('#school-autocomplete').hide();
      $('#school-name-field').show();
      $('#organization-name-field').hide();
      $('#hoc-event-location-field').show();
      $('#hoc-entire-school').show();
      $('#continue-btn').hide();
      $('#submit-btn').show();
    } else if ($('#hoc-event-type').val() === 'out_of_school') {
      // out of school, either US or non-US
      $('#school-autocomplete').hide();
      $('#organization-name-field').show();
      $('#hoc-event-location-field').show();
      $('#school-name-field').hide();
      $('#hoc-entire-school').hide();
      $('#continue-btn').hide();
      $('#submit-btn').show();
    }
  }

  $('#country').change(function () {
    checkShowNameEventLocation();
  });

  $('#hoc-event-type').change(function () {
    checkShowNameEventLocation();
  });

  function checkShowCensusFollowUp() {
    if ($("#twenty-hour-how-much").val() === "SOME" || $("#twenty-hour-how-much").val() === "ALL" || $("#ten-hour-how-much").val() === "SOME" ||
    $("#ten-hour-how-much").val() === "ALL") {
      $('#followup_questions').show();
    } else {
      $('#followup_questions').hide();
    }
  }

  $('#twenty-hour-how-much').change(function () {
    checkShowCensusFollowUp();
  });

  $('#ten-hour-how-much').change(function () {
    checkShowCensusFollowUp();
  });

  $('#role').change(function () {
    if ($(this).val() === "TEACHER" || $(this).val() === "ADMINISTRATOR") {
      $('#pledge').show();
    } else {
      $('#pledge').hide();
    }
  });
});

function showCensusForm(data) {
  $('.main-form').hide();
  $('#signup-header').hide();
  $('#join-us-header').hide();
  $('#submit').hide();

  $('#census-header').show();
  $('#thanks-header').show();
  $('#census-form').show();

  // Jump up to the top of the form
  window.location.hash = '#thanks-header';

  // Copy relevant hoc-signup inputs to the census form
  $('#census_email').val($('#hoc-email').val());
  $('#census_name').val($('#hoc-name').val());
  $('#census_school_id').val($('#hoc-signup-form input[name=nces_school_s]').val());
  $('#census_country').val($('#country').val());
  $('#census_school_name').val($('#school-name').val());
  $('#census_location').val($('#hoc-event-location').val());
}

function gotoThankYouPage() {
  window.location = thanksUrl;
}

function validateFields() {
  if ($("#hoc-name").val() === "") {
    $('#name-error').show();
    return false;
  } else {
    $('#name-error').hide();
  }

  if ($("#hoc-email").val() === "") {
    $('#email-error').show();
    return false;
  } else {
    $('#email-error').hide();
  }

  if ($("#country").val() === "") {
    $('#country-error').show();
    return false;
  } else {
    $('#country-error').hide();
  }

  if ($("#hoc-event-type").val() === "") {
    $('#event-type-error').show();
    return false;
  } else {
    $('#event-type-error').hide();
  }

  if ($("#hoc-event-type").val() === "out_of_school") {
    if ($("#organization-name").val() === "") {
      $('#organization-name-error').show();
      return false;
    } else {
      $('#organization-name-error').hide();
    }
  }

  if (($("#hoc-event-type").val() === "in_school") &&
      (($("#country").val() !== 'US') || (schoolData.nces === SCHOOL_NOT_FOUND))) {

    if ($("#school-name").val() === "") {
      $('#school-name-error').show();
      return false;
    } else {
      $('#school-name-error').hide();
    }

    if ($("#hoc-event-location").val() === "") {
      $('#event-location-error').show();
      return false;
    } else {
      $('#event-location-error').hide();
    }
  }

  if (($("#country").val() === 'US') && ($("#hoc-event-type").val() === "in_school")) {
    if (!schoolData.nces) {
      schoolData.showDropdownError = true;
      return false;
    } else {
      schoolData.showDropdownError = false;
    }
  }

  return true;
}

function signupFormError(data) {
  if (data.responseJSON.email_s[0] === "invalid") {
    $('#email-invalid-error').show();
  }
  $('#error_message').html("<p>" + signupErrorMessage + "</p>").show();
  $("#signup_submit").removeAttr('disabled');
}

function censusFormError(data) {
  $('#error_message').html("<p>" + censusErrorMessage + "</p>").show();
  $("#census_submit").removeAttr('disabled');
}

function signupFormSubmit(successHandler) {
  $("#signup_submit").attr('disabled','disabled');

  $.ajax({
    url: "/forms/HocSignup" + hocYear,
    type: "post",
    dataType: "json",
    data: $("#hoc-signup-form").serialize()
  }).done(successHandler).fail(signupFormError);
}

function censusFormSubmit() {
  $("#census_submit").attr('disabled','disabled');

  $.ajax({
    url: "/dashboardapi/v1/census/CensusHoc2017v3",
    type: "post",
    dataType: "json",
    data: $("#census-form").serialize()
  }).done(gotoThankYouPage).fail(censusFormError);
}
