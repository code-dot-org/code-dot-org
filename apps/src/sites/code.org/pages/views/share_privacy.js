/*
 * Contains firehose tracking for buttons on the student privacy page.
 */

import firehoseClient from '@cdo/apps/lib/util/firehose';

const LOCATION_TO_PDF_MAPPING = {
  '/privacy/student-privacy': '/files/privacy-policy-csf.pdf',
  '/privacy/student-privacy-csd': '/files/privacy-policy-csd.pdf',
  '/privacy/student-privacy-csp': '/files/privacy-policy-csp.pdf'
};

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

    let printFrame = document.getElementById('iFramePdf');
    if (!printFrame) {
      const pdfToPrint = LOCATION_TO_PDF_MAPPING[window.location.pathname];

      const iFramePdf = $(`
        <iframe
          id="iFramePdf"
          src="${pdfToPrint}"
          style="display:none;"
        ></iframe>
      `);

      $('body').append(iFramePdf);
      printFrame = iFramePdf[0];
    }
    printFrame.focus();
    printFrame.contentWindow.print();
  });
});
