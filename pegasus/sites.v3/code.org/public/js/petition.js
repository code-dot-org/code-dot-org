function Petition() {
  // placeholder text for non-HTML5 browsers
  $('input[type=text], textarea').placeholder();
  $('input[type=email], textarea').placeholder();
}

Petition.prototype.showAgeError = function (error) {
  $("input#age").toggleClass("input_error", error);
  $("#age_error").toggle(error);
};

Petition.prototype.showEmailError = function (error) {
  $("input#email").toggleClass("input_error", error);
  $("#email_error").toggle(error);
};

Petition.prototype.showNoError = function (noError) {
  $("#no_error").toggle(noError);
};

Petition.prototype.processResponse = function (data) {
  if (data.state_code_s && data.state_code_s !== "") {
    window.location.href = "/promote/" + data.state_code_s;
  } else {
    window.location.href = "/promote/thanks";
  }
};

Petition.prototype.processError = function (data) {
  $("#gobutton").removeAttr('disabled');
  $("#gobutton").addClass("button_enabled").removeClass("button_disabled");

  var badEmail = (data.status === 400 && data.responseJSON.email_s !== undefined);

  var badAge = !badEmail && (data.status === 400 && data.responseJSON.age_i !== undefined);

  Petition.prototype.showAgeError(badAge);
  Petition.prototype.showEmailError(badEmail);
  Petition.prototype.showNoError(!badAge && !badEmail);
};

Petition.prototype.signPetition = function () {
  $("#gobutton").attr('disabled','disabled');
  $("#gobutton").removeClass("button_enabled").addClass("button_disabled");

  this.showAgeError(false);
  this.showEmailError(false);
  this.showNoError(true);

  // Do not send the email or name server-side for under thirteen users for
  // privacy reasons.
  if (parseInt(document.getElementById('age').value) < 16) {
    document.getElementById('email').value = 'anonymous@code.org';
    document.getElementById('name').value = '';
  }

  $.ajax({
    url: "/forms/Petition",
    type: "post",
    dataType: "json",
    data: $('#petition_form').serialize()
  }).done(this.processResponse).fail(this.processError);

  return false;
};
