/* global cookieValue */

function showEmailError(error) {
  $("input#email").toggleClass("input_error", error);
  $("#email_error").toggle(error);
  $("#email_okay").toggle(!error);
}

function certificate_processResponse(data) {
  var form = $("#certificate_form");
  var thanks = $("#certificate_thanks");

  form.toggle(!data.certificate_sent);
  thanks.toggle(data.certificate_sent);

  if (data.certificate_sent && data.session) {
    personalizeCertificate(data.session);
  }
}

function processError(data) {
  $("#gobutton").removeAttr('disabled');
  $("#gobutton").addClass("button_enabled").removeClass("button_disabled");

  var badEmail = (data.status === 400 && data.responseJSON.email_s !== undefined);

  showEmailError(badEmail);
}

function requestCertificate(course_name) {
  $("#gobutton").attr('disabled', 'disabled');
  $("#gobutton").removeClass("button_enabled").addClass("button_disabled");

  showEmailError(false);

  if (cookieValue !== "null") {
    $('#session').attr('value', cookieValue);

    $.ajax({
      url: "/api/hour/certificate",
      type: "post",
      dataType: "json",
      data: $('#request-certificate-form').serialize()
    }).done(certificate_processResponse).fail(processError);
  } else {
    personalizeAnonymousCertificate(course_name);
  }
  return false;
}

/**
 * Without this, we get:
 *
 * InvalidCharacterError: Failed to execute 'btoa' on 'Window': The string to
 * be encoded contains characters outside of the Latin1 range.
 *
 * Workaround via
 * https://github.com/exupero/saveSvgAsPng/commit/fd9453f576d202dd36e08105cd18d5aed9174d22
 *
 * @param {string} data
 * @returns {string}
 */
function reEncodeNonLatin1(data) {
  var encodedData = encodeURIComponent(data);
  encodedData = encodedData.replace(/%([0-9A-F]{2})/g, function (match, p1) {
    return String.fromCharCode('0x' + p1);
  });
  return decodeURIComponent(encodedData);
}

function personalizeCertificate(session) {
  $('#hoc-certificate-small a').attr('href', '/printcertificate/' + session);
  $('#hoc-certificate-small img').attr('src', '/api/hour/certificate/' + session + '-890.jpg');
}

function personalizeAnonymousCertificate(course_name) {
  var certificateData = btoa(reEncodeNonLatin1(JSON.stringify({
    name: $("#request-certificate-form #name").val(),
    course: course_name
  })));
  $('#hoc-certificate-small a').attr('href', '/v2/hoc/certificate/' + certificateData + '.jpg');
  $('#hoc-certificate-small img').attr('src', '/v2/hoc/certificate/' + certificateData + '.jpg');
}
