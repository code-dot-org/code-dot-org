$(document).ready(function () {
  new google.maps.places.SearchBox(document.getElementById('hoc-event-location'));

  $('#hoc-signup-form select').selectize({
    plugins: ['fast_click']
  });

  $("#hoc-signup-form").submit(function ( event ) {
    if (validateFields()) {
      signupFormSubmit();
    }
  });

  $('.continue-btn').click(function () {
    if (validateFields()) {
      $('.main-form').hide();
      $('.continue-btn').hide();
      $('#census-questions').show();
      $('#submit').show();
    }
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
      $('#school-name-field').show();
      $('#organization-name-field').hide();
      $('#hoc-event-location-field').show();
      $('#hoc-entire-school').show();
      // continue button goes to census questions on click
      $('.continue-btn').show();
      $('#submit').hide();
    } else if (($('#hoc-event-type').val() === 'in_school')){
    // in-school & NOT US
      $('#school-name-field').show();
      $('#organization-name-field').hide();
      $('#hoc-event-location-field').show();
      $('#hoc-entire-school').show();
      $('.continue-btn').hide();
      $('#submit').show();
    } else if ($('#hoc-event-type').val() === 'out_of_school') {
      // out of school, either US or non-US
      $('#organization-name-field').show();
      $('#hoc-event-location-field').show();
      $('#school-name-field').hide();
      $('#hoc-entire-school').hide();
      $('.continue-btn').hide();
      $('#submit').show();
    }
  }

  $('#country').change(function () {
    checkShowNameEventLocation();
  });

  $('#hoc-event-type').change(function () {
    checkShowNameEventLocation();
  });

  function checkShowCensusFollowUp() {
    if ($("#twenty-hour-how-much").val() === "some" || $("#twenty-hour-how-much").val() === "all" || $("#ten-hour-how-much").val() === "some" ||
    $("#ten-hour-how-much").val() === "all") {
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
    if ($(this).val() === "teacher" || $(this).val() === "administrator") {
      $('#pledge').show();
    } else {
      $('#pledge').hide();
    }
  });
 });

function signupFormComplete(data) {
  window.location = "#{resolve_url('thanks')}";
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

  if  ($("#hoc-event-type").val() === "in_school") {
    if ($("#school-name").val() === "") {
      $('#school-name-error').show();
      return false;
    } else {
      $('#school-name-error').hide();
    }
  }

  if  ($("#hoc-event-type").val() === "out_of_school") {
    if ($("#organization-name").val() === "") {
      $('#organization-name-error').show();
      return false;
    } else {
      $('#organization-name-error').hide();
    }
  }

  if ($("#hoc-event-location").val() === "") {
    $('#event-location-error').show();
    return false;
  } else {
    $('#event-location-error').hide();
  }
  return true;
}

function signupFormError(data) {
  $('#error_message').html("<p>#{signup_submit_error_message}</p>").show();
  $("#signup_submit").removeAttr('disabled');
}

function signupFormSubmit() {
  $("#signup_submit").attr('disabled','disabled');

  $.ajax({
    url: "/forms/HocSignup2017",
    type: "post",
    dataType: "json",
    data: $("#hoc-signup-form").serialize()
  }).done(signupFormComplete).fail(signupFormError);
}
