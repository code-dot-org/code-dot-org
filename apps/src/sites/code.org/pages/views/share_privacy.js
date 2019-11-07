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
      let pdfToPrintHash = {
        '/privacy/student-privacy': '/files/privacy-policy-csf.pdf',
        '/privacy/student-privacy-csd': '/files/privacy-policy-csd.pdf',
        '/privacy/student-privacy-csp': '/files/privacy-policy-csp.pdf'
      };

      let pdfToPrint = pdfToPrintHash[window.location.pathname];

      let iFramePdf = $(
        '<iframe id="iFramePdf" src=' +
          pdfToPrint +
          ' style="display:none;"></iframe>'
      );
      $('body').append(iFramePdf);
    }

    let getPrintFrame = document.getElementById('iFramePdf');
    getPrintFrame.focus();
    getPrintFrame.contentWindow.print();
  });
});
