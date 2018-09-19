import $ from 'jquery';

const TEACHER_ONLY_FIELDS = ["#teacher-name-field", "#email-preference-dropdown"];
const STUDENT_ONLY_FIELDS = ["#student-name-field", "#age-dropdown", "#student-consent"];
const SHARED_FIELDS = ["#gender-dropdown", "#terms-of-service"];
const ALL_FIELDS = [TEACHER_ONLY_FIELDS, STUDENT_ONLY_FIELDS, SHARED_FIELDS];

$(document).ready(() => {
  $("#user_user_type").change(function () {
    var value = $(this).val();
    switch (value) {
      case "teacher":
        switchToTeacher();
        break;
      case "student":
        switchToStudent();
        break;
      default:
        hideFields(ALL_FIELDS); // Hide everything
    }
  });

  function switchToTeacher() {
    // Show teacher and shared fields
    fadeInFields(TEACHER_ONLY_FIELDS);
    fadeInFields(SHARED_FIELDS);

    // Hide student fields
    hideFields(STUDENT_ONLY_FIELDS);
  }

  function switchToStudent() {
    // Show student and shared fields
    fadeInFields(STUDENT_ONLY_FIELDS);
    fadeInFields(SHARED_FIELDS);

    hideFields(TEACHER_ONLY_FIELDS); // Hide teacher fields
  }

  function fadeInFields(fields) {
    $(fields.join(', ')).fadeIn();
  }

  function hideFields(fields) {
    $(fields.join(', ')).hide();
  }
});
