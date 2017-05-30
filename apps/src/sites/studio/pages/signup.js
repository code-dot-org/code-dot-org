import $ from 'jquery';

window.SignupManager = function (options) {
  this.options = options;
  var self = this;

  // Check for URL having: /users/sign_up?user%5Buser_type%5D=teacher
  if (self.options.isTeacher === "true") {
    // Select teacher in dropdown.
    $("#user_user_type").val("teacher");

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
    var fields = [
      "user_type",
      "name",
      "email",
      "password",
      "password_confirmation",
      "age",
      "gender",
      "terms_of_service_version",
      "school_info.zip"
    ];

    for (var i = 0; i < fields.length; i++) {
      var field = fields[i];
      if (err.responseJSON.errors[field]) {
        var errorField = $(`#${field}-block .error_in_field`);
         // We have a custom inline message for user_type errors already set in the DOM.
        if (field === "terms_of_service_version") {
          errorField.text(self.options.acceptTermsString);
        } else if (field === "school_info.zip") {
          errorField = $('#school-zip').find('.error_in_field');
          errorField.text(err.responseJSON.errors[field][0]);
        } else if (field !== "user_type") {
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

  function setSchoolInfoVisibility(state) {
    if (state) {
      $("#schooldropdown-block").fadeIn();
    } else {
      $("#schooldropdown-block").hide();
    }
  }

  function showStudent() {
    // Show correct form elements.
    $("#age-block").fadeIn();
    $("#gender-block").fadeIn();
    $("#name-student").fadeIn();
    $("#name-teacher").hide();
    setSchoolInfoVisibility(false);

    // Show correct terms below form.
    $("#student-terms").fadeIn();
    $("#teacher-terms").hide();

    // Implicitly accept terms of service for students.
    $("#user_terms_of_service_version").prop('checked', true);
  }

  function showTeacher() {
    // Show correct form elements.
    $("#age-block").hide();
    $("#gender-block").hide();
    $("#name-student").hide();
    $("#name-teacher").fadeIn();
    setSchoolInfoVisibility(true);

    // Show correct terms below form.
    $("#student-terms").hide();
    $("#teacher-terms").fadeIn();

    // Force teachers to explicitly accept terms of service.
    $("#user_terms_of_service_version").prop('checked', false);
  }

  function getUserTypeSelected() {
    const formData = $('#new_user').serializeArray();
    const userType = $.grep(formData, e => e.name === "user[user_type]");
    if (userType.length === 1) {
      return userType[0].value;
    }
    return "no_user_type";
  }

  function isTeacherSelected() {
    return getUserTypeSelected() === "teacher";
  }

  $(".signupform").submit(function () {
    // Clear the prior hashed email.
    $('#user_hashed_email').val('');

    // Hash the email.
    window.dashboard.hashEmail({email_selector: "#user_email",
      hashed_email_selector: "#user_hashed_email",
      age_selector: "#user_user_age",
      skip_clear_email: true});

    var formData = $("#new_user").serializeArray();

    if (isTeacherSelected()) {
      // Teachers get age 21 in the form data.
      formData.push({name: "user[age]", value: "21+"});
    } else {
      // Students have their email cleared from the form data.
      // (But we left it showing in the form UI in case they
      // reattempt.)
      $.grep(formData, e => e.name === "user[email]")[0].value = "";
      $.grep(formData, e => e.name.startsWith("user[school_info_attributes]"))
        .forEach(x => x.value = "");
    }

    // Hide all errors that might be showing from a previous attempt.
    $(".error_in_field").css("opacity", 0);

    // Hide any other hint messages that might be showing based on input.
    $("#password_message").text("");
    $("#password_message_confirmation").text("");

    $.ajax({
      url: "/users.json",
      type: "post",
      dataType: "json",
      data: formData
    }).done(formSuccess).fail(formError);

    return false;
  });

  $("#user_password").on('input',function (e) {
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

  $("#user_password_confirmation").on('input', function (e) {
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

  $("#user_name").placeholder();
  $("#user_email").placeholder();
  $("#user_school").placeholder();
};
