/*
 * Contains firehose tracking for buttons on the student privacy page.
 */

import firehoseClient from '@cdo/apps/lib/util/firehose';

$(document).ready(function() {
  $('#share_on_remind').click(function() {
    firehoseClient.putRecord({
      study: 'share_student_privacy',
      study_group: 'share_student_privacy',
      event: 'shared_on_remind'
    });
  });
  $('#email_button').click(function() {
    firehoseClient.putRecord({
      study: 'share_student_privacy',
      study_group: 'share_student_privacy',
      event: 'emailed'
    });
  });
  $('#print_button').click(function() {
    firehoseClient.putRecord({
      study: 'share_student_privacy',
      study_group: 'share_student_privacy',
      event: 'printed'
    });

    // Prevent repeatedly adding this iframe if button pressed repeatedly
    if (!$('#iFramePdf').length) {
      let iFramePdf = $('<iframe id="iFramePdf" src="/files/privacy-policy-csp.pdf" style="display:none;"></iframe>');
      $('body').append(iFramePdf);
    }

    let getMyFrame = document.getElementById("iFramePdf");
    getMyFrame.focus();
    getMyFrame.contentWindow.print();
  });
});
