/* jshint globals: $ */

$(document).ready(function() {
  $("#pd-workshop-survey-form")
    .find("select")
    .selectize();

  $("#pd-workshop-survey-form").submit(function(event) {
    PdWorkshopSurveyFormSubmit(event);
  });

  $("input[name='how_heard_ss[]']:checkbox").change(function() {
    if ($("input[name='how_heard_ss[]'][value='Other']").is(":checked")) {
      $("#how-heard-other-wrapper").show();
    } else {
      $("#how-heard-other-wrapper").hide();
    }
  });

  $("input[name='attendee_type_s']").change(function() {
    // These button groups are shared between the admin and counselor sections. Make sure
    // we never submit a hidden answer after switching between Counselor and Admin.
    $("input[name='understand_curricular_offerings_s']").prop("checked", false);
    $("input[name='understand_professional_experiences_s']").prop(
      "checked",
      false
    );

    if (
      $("input[name='attendee_type_s'][value='Administrator']").is(":checked")
    ) {
      $(".counselor-section").hide();
      $(".admin-section").show();
    } else {
      $(".admin-section").hide();
      $(".counselor-section").show();
    }
  });
});

function processResponse() {
  $("#btn-submit").removeAttr("disabled");
  $("#btn-submit")
    .removeClass("button_disabled")
    .addClass("button_enabled");
  $("#pd-workshop-survey-form").hide();
  $("#thanks").show();
}

function processError(data) {
  $(".has-error").removeClass("has-error");

  var error_field_names = Object.keys(data.responseJSON);
  var errors_count = error_field_names.length;

  for (var i = 0; i < errors_count; ++i) {
    var error_field_name = error_field_names[i].replace(/_ss$/, "_ss[]");
    var query = ".control-label[for='" + error_field_name + "']";
    $(query)
      .parents(".form-group")
      .addClass("has-error");
  }

  $("#error-message")
    .text(
      "An error occurred. Please check to make sure all required fields have been filled out."
    )
    .show();

  window.scrollTo(0, 0);
  $("#btn-submit").removeAttr("disabled");
  $("#btn-submit")
    .removeClass("button_disabled")
    .addClass("button_enabled");
}

function PdWorkshopSurveyFormSubmit(event) {
  $("#btn-submit").attr("disabled", "disabled");
  $("#btn-submit")
    .removeClass("button_enabled")
    .addClass("button_disabled");

  $.ajax({
    url: "/forms/PdWorkshopSurveyCounselorAdmin",
    type: "post",
    dataType: "json",
    data: $("#pd-workshop-survey-form").serialize()
  })
    .done(processResponse)
    .fail(processError);

  event.preventDefault();
}
