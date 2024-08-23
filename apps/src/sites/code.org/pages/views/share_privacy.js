/*
 * Contains firehose tracking for buttons on the student privacy page.
 */

import harness from '@cdo/apps/lib/util/harness';

$(document).ready(function () {
  $('#share_on_remind').click(function () {
    harness.trackAnalytics({
      study: 'share_student_privacy',
      study_group: 'share_student_privacy',
      event: 'shared_on_remind',
    });
  });
  $('#email_button').click(function () {
    harness.trackAnalytics({
      study: 'share_student_privacy',
      study_group: 'share_student_privacy',
      event: 'emailed',
    });
  });
  $('#print_button').click(function () {
    harness.trackAnalytics({
      study: 'share_student_privacy',
      study_group: 'share_student_privacy',
      event: 'printed',
    });
  });
});
