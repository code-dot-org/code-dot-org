function processVolunteerUnsubscribeResponse(data) {
  $("form").hide();
  $("#unsubscribe-volunteer-thanks").show();
}

function processVolunteerUnsubscribeError(data) {
  var errorMessage = null;

  var errors = Object.keys(data.responseJSON);

  for (var i = 0; i < errors.length; i++) {
    if (errors[i] === "age_18_plus_b") {
      errorMessage =
        "An error occurred. You must be 18 to volunteer. " +
        "Please certify that you are at least 18 years old to update your preferences. " +
        "If you are not yet 18, please request to remove yourself from the volunteer list by " +
        '<a href="https://support.code.org/hc/en-us/requests/new" target="_blank">contacting support</a>.';
    } else if (errors[i] === "email_preference_opt_in_s") {
      errorMessage = "Please select an email preference below.";
    }
  }

  if (!errorMessage) {
    errorMessage =
      "An error occurred. Please try again or " +
      '<a href="https://support.code.org/hc/en-us/requests/new" target="_blank">' +
      "contact us</a> if you continue to receive this error.";
  }

  $("#unsubscribe-volunteer-form .error-message")
    .html(errorMessage)
    .show();
  window.scrollTo(0, 0);
  $("#btn-submit").removeAttr("disabled");
  $("#btn-submit")
    .removeClass("button_disabled")
    .addClass("button_enabled");
}

window.unsubscribeVolunteerList = function() {
  $("#btn-submit").attr("disabled", "disabled");
  $("#btn-submit")
    .removeClass("button_enabled")
    .addClass("button_disabled");

  var secret = $("#volunteer-secret").text();
  var formResults = $("#unsubscribe-volunteer-form").serializeArray();

  var data = {};
  $(formResults).each(function(index, obj) {
    data[obj.name] = obj.value;
  });

  $.ajax({
    url: "/v2/forms/VolunteerEngineerSubmission2015/" + secret + "/update",
    method: "post",
    contentType: "application/json; charset=utf-8",
    data: JSON.stringify(data)
  })
    .done(processVolunteerUnsubscribeResponse)
    .fail(processVolunteerUnsubscribeError);

  return false;
};
