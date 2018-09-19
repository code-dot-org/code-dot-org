import $ from 'jquery';

$(document).ready(() => {
  $("#user_user_type").change(function () {
    var value = $(this).val();
    switch (value) {
      case "teacher":
        showTeacher();
        break;
      case "student":
        showStudent();
        break;
      default:
        // hide everything
    }
  });

  function showTeacher() {
    // Show teacher fields
    $("#teacher-name-field").fadeIn();
    $("#gender-dropdown").fadeIn();
    $("#email-preference-dropdown").fadeIn();
    $("#terms-of-service").fadeIn();
    // Hide student fields
    $("#student-name-field").hide();
    $("#age-dropdown").hide();
    $("#student-consent").hide();
  }

  function showStudent() {
    // Show student fields
    $("#student-name-field").fadeIn();
    $("#age-dropdown").fadeIn();
    $("#gender-dropdown").fadeIn();
    $("#terms-of-service").fadeIn();
    $("#student-consent").fadeIn();
    // Hide teacher fields
    $("#teacher-name-field").hide();
    $("#email-preference-dropdown").hide();
  }
});
