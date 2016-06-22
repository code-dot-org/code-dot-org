import $ from 'jquery';

window.SignupManager = function (options) {
  this.options = options;
  var self = this;

  // Check for URL having: /users/sign_up?user%5Buser_type%5D=teacher
  if (self.options.isTeacher === "true") {
    // Select teacher in dropdown.
    $("#user_user_type").val("teacher");

    // Show teacher fields.
    showTeacher();
  }

  function formSuccess(success) {
    var url;
    if (self.options.returnToUrl !== "") {
      url = self.options.returnToUrl;
    } else if (isTeacherSelected()) {
      url = self.options.teacherDashboardUrl;
    } else {
      url = "/";
    }
    window.location.href = url;
  }

  function formError(err) {
    // Define the fields that can have specific errors attached to them.
    var fields = ["user_type", "name", "email", "password", "password_confirmation", "schoolname", "age", "gender"];

    for (var i = 0; i < fields.length; i++) {
      var field = fields[i];
      if (err.responseJSON.errors[field]) {
        var errorField = $("#" + field + "-block .error_in_field");
        // We have a custom inline message for user_type errors already set in the DOM.
        if (field !== "user_type") {
          errorField.text(err.responseJSON.errors[field][0]);
        }
        errorField.fadeTo("normal", 1);
      }
    }
  }

  $("#user_user_type").change(function () {
    var value = $(this).val();
    if (value === "student") {
      showStudent();
    } else if (value === "teacher") {
      showTeacher();
    }
  });

  function showStudent() {
    // Show correct form elements.
    $("#age-block").fadeIn();
    $("#gender-block").fadeIn();
    $("#schoolname-block").hide();
    $("#schoolcountry-block").hide();
    $("#district-block").hide();

    // Clear country.  It can be reentered again to make district dropdown appear.
    $("#schoolcountry").val("");

    // Show correct terms below form.
    $("#teacher-terms").hide();
    $("#student-terms").fadeIn();
  }

  function showTeacher() {
    // Show correct form elements.
    $("#age-block").hide();
    $("#gender-block").hide();
    $("#schoolname-block").fadeIn();
    $("#schoolcountry-block").fadeIn();

    // Show correct terms below form.
    $("#student-terms").hide();
    $("#teacher-terms").fadeIn();
  }

  function isTeacherSelected() {
    var formData = $('#new_user').serializeArray();
    var userType = $.grep(formData, function (e) { return e.name === "user[user_type]"; });
    if (userType.length === 1 && userType[0].value === "teacher") {
      return true;
    }
    return false;
  }

  $(".signupform").submit(function () {
    var formData = $('#new_user').serializeArray();

    // Teachers get age 21.
    if (isTeacherSelected()) {
      formData.push({name: 'user[age]', value: 21});
    }

    // Hide all errors that might be showing from a previous attempt.
    $(".error_in_field").css("opacity", 0);

    // Hide any other hint messages that might be showing based on input.
    $('#password_message').text("");
    $('#password_message_confirmation').text("");

    $.ajax({
      url: "/users.json",
      type: "post",
      dataType: "json",
      data: formData
    }).done(formSuccess).fail(formError);

    return false;
  });

  $("#user_password").on('input', function (e) {
    var password = $(this).val();
    var password_message = $("#password-block .error_in_field");
    var password_message_confirmation = $("#password_confirmation-block .error_in_field");
    if (!password || password.length < 6) {
      password_message.text(self.options.invalidPasswordString);
      password_message.fadeTo("normal", 1);
    } else {
      password_message.text("");
    }
    password_message_confirmation.text("");
  });

  $("#user_password_confirmation").on('input', function (e){
    var conf_password = $(this).val();
    var origin_password = $('#user_password').val();
    var password_message = $("#password-block .error_in_field");
    var password_message_confirmation = $("#password_confirmation-block .error_in_field");
    if (conf_password !== origin_password) {
      password_message_confirmation.text(self.options.passwordMismatchString);
      password_message_confirmation.fadeTo("normal", 1);
    } else {
      password_message_confirmation.text("");
    }
    password_message.text("");
  });

  $('#schoolcountry').change(function () {
    if ($(this).val() === 'US') {
      $("#district-block").fadeIn();
    } else {
      $("#district-block").fadeOut();
    }
  });

  $("#user_name").placeholder();
  $("#user_email").placeholder();
  $("#user_school").placeholder();

  $(".signupform").on("submit", function (e) {
    window.dashboard.hashEmail({ email_selector: '#user_email',
      hashed_email_selector: '#user_hashed_email',
      age_selector: '#user_age'});
  });
};
