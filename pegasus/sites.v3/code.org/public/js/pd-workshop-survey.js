$(document).ready(function () {
  $('#pd-workshop-survey-form').find("select").selectize({
    plugins: ['fast_click']
  });

  $('#pd-workshop-survey-form').submit(function (event) {
    PdWorkshopSurveyFormSubmit(event);
  });

  $("input[name=consent_b]:radio").change(function () {
    if ($("input[name=consent_b][value=1]").is(":checked")) {
      $(".consent-only").show();
    } else {
      $(".consent-only").hide();
    }
  });

  $("input[name=will_teach_b]:radio").change(function () {
    if ($("input[name=will_teach_b][value=0]").is(":checked")) {
      $("#will-teach-no-explain-wrapper").show();
    } else {
      $("#will-teach-no-explain-wrapper").hide();
    }
  });

  $("select[name='reason_for_attending_ss[]']").change(function () {
    if ($.inArray('Other', $(this).val()) > -1) {
      $('#reason-for-attending-other-wrapper').show();
    } else {
      $('#reason-for-attending-other-wrapper').hide();
    }
  });

  $("select[name='how_heard_ss[]']").change(function () {
    if ($.inArray('Other', $(this).val()) > -1) {
      $('#how-heard-other-wrapper').show();
    } else {
      $('#how-heard-other-wrapper').hide();
    }
  });

  $("select[name='subjects_taught_ss[]']").change(function () {
    if ($.inArray('Computer Science', $(this).val()) > -1) {
      $('#years-taught-cs-wrapper').show();
    } else {
      $('#years-taught-cs-wrapper').hide();
    }
  });

  $(".agree-scale").tooltip();
});

function processResponse() {
  $("#btn-submit").removeAttr('disabled');
  $("#btn-submit").removeClass("button_disabled").addClass("button_enabled");
  $('#pd-workshop-survey-form').hide();
  $('#thanks').show();
}

function processError(data) {
  $('.has-error').removeClass('has-error');

  var error_field_names = Object.keys(data.responseJSON);
  var errors_count = error_field_names.length;

  for (var i = 0; i < errors_count; ++i) {
    var error_field_name = error_field_names[i].replace(/_ss$/,'_ss[]');
    var query = ".control-label[for='" + error_field_name + "']";
    $(query).parents('.form-group').addClass('has-error');
  }

  $('#error-message').text('An error occurred. Please check to make sure all required fields have been filled out.').show();

  $('body').scrollTop(0);
  $("#btn-submit").removeAttr('disabled');
  $("#btn-submit").removeClass("button_disabled").addClass("button_enabled");
}

function PdWorkshopSurveyFormSubmit(event) {
  $("#btn-submit").attr('disabled','disabled');
  $("#btn-submit").removeClass("button_enabled").addClass("button_disabled");

  $.ajax({
    url: "/forms/PdWorkshopSurvey",
    type: "post",
    dataType: "json",
    data: $('#pd-workshop-survey-form').serialize()
  }).done(processResponse).fail(processError);

  event.preventDefault();
}
