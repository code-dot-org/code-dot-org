// Code provided from Google reCAPTCHA
// https://www.sfdcpoint.com/salesforce/salesforce-web-to-lead-form-with-recaptcha/
function timestamp() {
  var response = document.getElementById("g-recaptcha-response");
  if (response === null || response.value.trim() === "") {
    var elems = JSON.parse(
      document.getElementsByName("captcha_settings")[0].value
    );
    elems["ts"] = JSON.stringify(new Date().getTime());
    document.getElementsByName("captcha_settings")[0].value = JSON.stringify(
      elems
    );
  }
}
setInterval(timestamp, 500);

// Set a disabled attribute on button until
// the reCAPTCHA checkbox is clicked.
// Uses the data-callback attribute to check for a successful response.
// Docs: https://developers.google.com/recaptcha/docs/display
// eslint-disable-next-line no-unused-vars
function recaptchaCallback() {
  const btnSubmit = document.querySelector("button");

  if (btnSubmit.hasAttribute("disabled")) {
    btnSubmit.removeAttribute("disabled");
  }
}
