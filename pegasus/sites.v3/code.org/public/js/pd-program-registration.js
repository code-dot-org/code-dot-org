/* global FastClick */
$(document).ready(function () {
  FastClick.attach(document.body);

  if ($('#pd-program-registration-form').length === 1) {
    // If the form is rendered, popup a warning before navigating away (e.g. browser back button).
    window.onbeforeunload = function () {
      // Note, most browsers ignore this message and display a standard one.
      return "Are you sure you want to leave? All answers will be lost.";
    };
  }

  $('#pd-program-registration-form').submit(function (event) {
    onPdProgramRegistrationFormSubmit(event);
  });

  $("input[name=accept_b]:radio").change(function () {
    if ($("input[name=accept_b][value=1]").is(":checked")) {
      $("#accept-yes").show();
      $("#accept-no").hide();
    } else {
      $("#accept-no").show();
      $("#accept-yes").hide();
    }
  });

  $("input[name=accept_no_reason_s]:radio").change(function () {
    if ($("input[name=accept_no_reason_s][value='Other']").is(":checked")) {
      $('#accept-no-other-wrapper').show();
    } else {
      $('#accept-no-other-wrapper').hide();
    }
  });

  $("input[name='dietary_needs_ss[]']:checkbox").change(function () {
    if ($("input[name='dietary_needs_ss[]'][value='Food Allergy']").is(":checked")) {
      $('#allergy-list-wrapper').show();
    } else {
      $('#allergy-list-wrapper').hide();
    }
    if ($("input[name='dietary_needs_ss[]'][value='Other']").is(":checked")) {
      $('#dietary-needs-other-wrapper').show();
    } else {
      $('#dietary-needs-other-wrapper').hide();
    }
  });

  $('#btn-section1-next').click(function () {
    showSection(2);
  });
  $('#btn-section2-next').click(function () {
    showSection(3);
  });
  $('#btn-section3-next').click(function () {
    showSection(4);
  });
  $('#btn-section2-back').click(function () {
    showSection(1);
  });
  $('#btn-section3-back').click(function () {
    showSection(2);
  });
  $('#btn-section4-back').click(function () {
    showSection(3);
  });
});

// Hide all sections and show section n
function showSection(n) {
  $('[id^=section]').hide();
  $('#section' + n).show();
}

function processResponse() {
  $("#btn-submit").removeAttr('disabled');
  $("#btn-submit").removeClass("button_disabled").addClass("button_enabled");
  $('#pd-program-registration-form').hide();
  window.onbeforeunload = null;

  if ($("input[name=accept_b][value=1]").is(":checked")) {
    $('#thanks').show();
  } else {
    $('#not-attending').show();
  }
}

function processError(data) {
  $('.has-error').removeClass('has-error');

  var error_field_names = Object.keys(data.responseJSON);
  var errors_count = error_field_names.length;

  var first_error_field = null;
  for (var i = 0; i < errors_count; ++i) {
    var error_field_name = error_field_names[i].replace(/_ss$/,'_ss[]');
    var query = ".control-label[for='" + error_field_name + "']";
    $(query).parents('.form-group').addClass('has-error');
    if (!first_error_field) {
      first_error_field = $(query);
      console.log(query);
    }
  }

  if (first_error_field) {
    // hide all sections, then show the one containing the first error field.
    $('[id^=section]').hide();
    $(first_error_field).closest('[id^=section]').show();
  }

  $('#error-message').text('An error occurred. Please check to make sure all required fields have been filled out.').show();

  $('body').scrollTop(0);
  $("#btn-submit").removeAttr('disabled');
  $("#btn-submit").removeClass("button_disabled").addClass("button_enabled");
}

function onPdProgramRegistrationFormSubmit(event) {
  $("#btn-submit").attr('disabled','disabled');
  $("#btn-submit").removeClass("button_enabled").addClass("button_disabled");

  $.ajax({
    url: "/forms/PdProgramRegistration",
    type: "post",
    dataType: "json",
    data: $('#pd-program-registration-form').serialize()
  }).done(processResponse).fail(processError);

  event.preventDefault();
}
