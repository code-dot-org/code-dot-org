import React from 'react';
import {createRoot} from 'react-dom/client';

import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import CertificateBatch from '@cdo/apps/templates/certificates/CertificateBatch';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const certificateData = getScriptData('certificate');
  const {courseName, courseTitle, studentNames, imageUrl} = certificateData;
  analyticsReporter.sendEvent(EVENTS.BATCH_CERTIFICATES_PAGE_VIEWED);
  const root = createRoot(document.getElementById('certificate-batch'));

  root.render(
    <CertificateBatch
      courseName={courseName}
      courseTitle={courseTitle}
      initialStudentNames={studentNames}
      imageUrl={imageUrl}
    />
  );
});
