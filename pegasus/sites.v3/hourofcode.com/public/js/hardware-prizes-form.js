$(document).ready(function() {

  $('#hoc-prizes-form select').selectize();

  $('#hoc-prizes-form').ajaxForm();
  $("#hoc-prizes-form").submit(function( event ) {
    prizesFormSubmit();
  });
});

function signupFormComplete()
{
  window.location = 'prizes-thanks';
}

function signupFormError(data)
{
  $('.has-error').removeClass('has-error');

  errors = Object.keys(data.responseJSON);
  errors_count = errors.length;

  for (i = 0; i < errors_count; ++i) {
    error_id = '#hoc-prizes-' + errors[i].replace(/_/g, '-');
    error_id = error_id.replace(/-[sb]s?$/, '');
    $(error_id).parents('.form-group').addClass('has-error');

    if (error_id == '#hoc-prizes-qualifying-school') {
      $(error_id).parents('label').addClass('has-error');
    }
  }

  $('#error-message').text('An error occurred. Please check to make sure all required fields have been filled out properly. Your school must be a K-12 US public school to qualify. Be sure you have selected a logistics plan to upload.').show();

  $('body').scrollTop($('#hoc-prizes-form').offset().top);
  $("#btn-submit").removeAttr('disabled');
  $("#btn-submit").removeClass("button_disabled").addClass("button_enabled");
}

function prizesFormSubmit()
{
  $("#btn-submit").attr('disabled','disabled');

  $('#hoc-prizes-form').ajaxSubmit({success: signupFormComplete, error: signupFormError});

  return false;
}
