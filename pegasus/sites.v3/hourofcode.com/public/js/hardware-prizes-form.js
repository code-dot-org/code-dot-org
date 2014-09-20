$(document).ready(function() {
  $('#hoc-prizes-form select').selectize();

  $('#hoc-prizes-form').ajaxForm();
  $("#hoc-prizes-form").submit(function( event ) {
    prizesFormSubmit();
  });

  $('input, select, textarea').removeAttr("required");
});

function signupFormComplete()
{
  window.location = 'prizes-thanks';
}

function signupFormError(data)
{
  $('#error_message').html('<p>An error occurred. Please check to make sure all required fields have been filled out properly.</p>').show();
  $("#btn-submit").removeAttr('disabled');
}

function prizesFormSubmit()
{
  $("#btn-submit").attr('disabled','disabled');

  $('#hoc-prizes-form').ajaxSubmit({success: signupFormComplete, error: signupFormError});

  return false;
}
