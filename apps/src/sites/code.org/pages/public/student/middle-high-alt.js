import initResponsive from '@cdo/apps/code-studio/responsive';

$(document).ready(function() {
  initResponsive();

  $('.hoc-tiles-container').load('/dashboardapi/middle_high_student_labs');
});
