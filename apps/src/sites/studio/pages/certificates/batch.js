import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import CertificateBatch from '@cdo/apps/templates/certificates/CertificateBatch';

$(document).ready(function() {
  const certificateData = getScriptData('certificate');
  const {courseName, courseTitle, studentNames, imageUrl} = certificateData;
  ReactDOM.render(
    <CertificateBatch
      courseName={courseName}
      courseTitle={courseTitle}
      initialStudentNames={studentNames}
      imageUrl={imageUrl}
    />,
    document.getElementById('certificate-batch')
  );
});
