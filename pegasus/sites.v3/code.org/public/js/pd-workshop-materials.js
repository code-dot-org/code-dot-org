$(document).ready(function () {
  $('#pd-workshop-materials-form').submit(function (event) {
    PdWorkshopSurveyFormSubmit(event);
  });
});

function processResponse() {
  $("#btn-submit").removeAttr('disabled');
  $("#btn-submit").removeClass("button_disabled").addClass("button_enabled");
  $('#pd-workshop-materials-form').hide();
  $('#thanks').show();
}

function processError(data) {
  $('.has-error').removeClass('has-error');

  var error_field_names = Object.keys(data.responseJSON);
  var errors_count = error_field_names.length;

  for (var i = 0; i < errors_count; ++i) {
    var query = ".control-label[for='" + error_field_names[i] + "']";
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
    url: "/forms/PdWorkshopMaterials",
    type: "post",
    dataType: "json",
    data: $('#pd-workshop-materials-form').serialize()
  }).done(processResponse).fail(processError);

  event.preventDefault();
}
