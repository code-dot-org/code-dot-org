import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import PrintCertificateBatch from '@cdo/apps/templates/certificates/PrintCertificateBatch';

$(document).ready(function() {
  const certificateData = getScriptData('certificate');
  const {courseName, imageUrl, studentNames} = certificateData;
  ReactDOM.render(
    <PrintCertificateBatch
      courseName={courseName}
      imageUrl={imageUrl}
      studentNames={studentNames}
    />,
    document.getElementById('print-certificate-batch')
  );
});
