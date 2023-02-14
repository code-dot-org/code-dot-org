// Code provided from Google reCAPTCHA
function timestamp() {
  var response = document.getElementById("g-recaptcha-response");

  if (response === null || response.value.trim() === "") {
    var elems = JSON.parse(document.getElementsByName("captcha_settings")[0].value);
    elems["ts"] = JSON.stringify(new Date().getTime());
    document.getElementsByName("captcha_settings")[0].value = JSON.stringify(elems);
  }
}

setInterval(timestamp, 500);

// Set a disabled attribute on button until
// the reCAPTCHA checkbox is clicked
function recaptchaCallback() {
  let btnSubmit = document.querySelector("button");

  if (btnSubmit.hasAttribute("disabled")) {
    btnSubmit.removeAttribute("disabled");
    btnSubmit.setAttribute("disabled");
  }
}

recaptchaCallback();
