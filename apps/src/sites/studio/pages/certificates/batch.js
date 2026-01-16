import React from 'react';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import CertificateBatch from '@cdo/apps/templates/certificates/CertificateBatch';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const certificateData = getScriptData('certificate');
  const {courseName, courseTitle, studentNames, imageUrl} = certificateData;
  analyticsReporter.sendEvent(EVENTS.BATCH_CERTIFICATES_PAGE_VIEWED);
  createReactRoot(
    <CertificateBatch
      courseName={courseName}
      courseTitle={courseTitle}
      initialStudentNames={studentNames}
      imageUrl={imageUrl}
    />,
    document.getElementById('certificate-batch')
  );
});
