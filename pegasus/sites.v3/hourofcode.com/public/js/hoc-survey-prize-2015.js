$(document).ready(function() {
  $(':input').removeAttr('required');

  $('#hoc-survey-form select').selectize({
    plugins: ['fast_click']
  });

  $( "#hoc-survey-form" ).submit(function( event ) {
    surveyFormSubmit();
  });
});

function surveyFormComplete(data)
{
  $('#hoc-survey-form').hide();
  $('#thanks').show();
}

function surveyFormError(data)
{
  $('.has-error').removeClass('has-error');

  var errors = Object.keys(data.responseJSON);
  var errors_count = errors.length;

  for (var i = 0; i < errors_count; ++i) {
    var error_id = '#' + errors[i].replace(/_/g, '-');
    error_id = error_id.replace(/-[sbi]s?$/, '');
    $(error_id).parents('.form-group').addClass('has-error');
  }

  $('#error-message').text('An error occurred. Please check to make sure all required fields have been filled out.').show();
  $("#signup_submit").removeAttr('disabled');

  $('body').scrollTop(0);
  $("#btn-submit").removeAttr('disabled');
  $("#btn-submit").removeClass("button_disabled").addClass("button_enabled");
}

function surveyFormSubmit()
{
  $("#signup_submit").attr('disabled','disabled');

  $.ajax({
    url: "/forms/HocSurveyPrize2015",
    type: "post",
    dataType: "json",
    data: $("#hoc-survey-form").serialize()
  }).done(surveyFormComplete).fail(surveyFormError);

  return false;
}
