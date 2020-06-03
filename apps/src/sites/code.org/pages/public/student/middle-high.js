import initResponsive from '@cdo/apps/code-studio/responsive';

document.addEventListener('DOMContentLoaded', () => {
  initResponsive();

  $(document).ready(function() {
    $('.hoc-tiles-container').load('/dashboardapi/middle_high_student_labs');
  });
});
