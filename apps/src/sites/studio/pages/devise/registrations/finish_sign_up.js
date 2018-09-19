import $ from 'jquery';

const TEACHER_ONLY_FIELDS = ["#teacher-name-label", "#school-dropdown", "#email-preference-dropdown", "#printable-terms-of-service"];
const STUDENT_ONLY_FIELDS = ["#student-name-label", "#age-dropdown", "#student-consent"];
const SHARED_FIELDS = ["#name-field", "#gender-dropdown", "#terms-of-service"];
const ALL_FIELDS = [TEACHER_ONLY_FIELDS, STUDENT_ONLY_FIELDS, SHARED_FIELDS];

$(document).ready(() => {
  $("#print-terms").click(function () {
    $("#print-frame")[0].contentWindow.print();
  });

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
        hideFields(ALL_FIELDS);
    }
  });

  function switchToTeacher() {
    fadeInFields(TEACHER_ONLY_FIELDS);
    fadeInFields(SHARED_FIELDS);
    hideFields(STUDENT_ONLY_FIELDS);
  }

  function switchToStudent() {
    fadeInFields(STUDENT_ONLY_FIELDS);
    fadeInFields(SHARED_FIELDS);
    hideFields(TEACHER_ONLY_FIELDS);
  }

  function fadeInFields(fields) {
    $(fields.join(', ')).fadeIn();
  }

  function hideFields(fields) {
    $(fields.join(', ')).hide();
  }
});
