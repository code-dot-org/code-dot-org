function showEmailError(error)
{
  $("input#email").toggleClass("input_error", error);
  $("#email_error").toggle(error);
  $("#email_okay").toggle(!error);
}

function certificate_processResponse(data)
{
  var form = $("#certificate_form");
  var thanks = $("#certificate_thanks");

  form.toggle(!data.certificate_sent);
  thanks.toggle(data.certificate_sent);

  if (data.certificate_sent && data.session) {
    personalizeCertificate(data.session);
  }
}

function processError(data)
{
  $("#gobutton").removeAttr('disabled');
  $("#gobutton").addClass("button_enabled").removeClass("button_disabled");

  var badEmail = (data.status == 400 && data.responseJSON.email_s !== undefined);

  showEmailError(badEmail);
}

function requestCertificate()
{
  $("#gobutton").attr('disabled','disabled');
  $("#gobutton").removeClass("button_enabled").addClass("button_disabled");

  showEmailError(false);

  if (cookieValue != "null") {
    $('#session').attr('value', cookieValue)

    $.ajax({
      url: "/api/hour/certificate",
      type: "post",
      dataType: "json",
      data: $('#request-certificate-form').serialize()
    }).done(certificate_processResponse).fail(processError);
  } else {
    personalizeAnonymousCertificate();
  }
  return false;
}

function personalizeCertificate(session)
{
  $('#hoc-certificate-small a').attr('href', '/printcertificate/' + session);
  $('#hoc-certificate-small img').attr('src', '/api/hour/certificate/' + session + '-890.jpg');
}

function personalizeAnonymousCertificate() {
  var courseName = "#{I18n.t(:"#{course}_name")}";

  var certificateData = btoa(JSON.stringify({name: $("#request-certificate-form #name").val(), course: courseName}))
  $('#hoc-certificate-small a').attr('href', '/v2/hoc/certificate/' + certificateData + '.jpg');
  $('#hoc-certificate-small img').attr('src', '/v2/hoc/certificate/' + certificateData + '.jpg');
}
