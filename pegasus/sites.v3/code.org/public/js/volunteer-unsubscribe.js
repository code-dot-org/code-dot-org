function processVolunteerUnsubscribeResponse(data)
{
  $('h1').hide();
  $('form').hide();
  $('#unsubscribe-volunteer-thanks').show();
}

function processVolunteerUnsubscribeError(data)
{
  $('#error-message').text('An error occurred. Please try again or contact us if you continue to receive this error.').show();
  $('body').scrollTop(0);
  $('#btn-submit').removeAttr('disabled');
  $('#btn-submit').removeClass('button_disabled').addClass('button_enabled');
}

function unsubscribeVolunteerList()
{
  $('#btn-submit').attr('disabled','disabled');
  $('#btn-submit').removeClass('button_enabled').addClass('button_disabled');

  var secret = $('#volunteer-secret').text();
  var formResults = $('#unsubscribe-volunteer-form').serializeArray();

  var data = {};
  $(formResults).each(function(index, obj){
    data[obj.name] = obj.value;
  });

  $.ajax({
    url: "/v2/forms/VolunteerEngineerSubmission2015/" + secret + "/update",
    method: "post",
    contentType: "application/json; charset=utf-8",
    data: JSON.stringify(data)
  }).done(processVolunteerUnsubscribeResponse).fail(processVolunteerUnsubscribeError);

  return false;
}
