import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import PrintCertificateBatch from '@cdo/apps/templates/certificates/PrintCertificateBatch';

$(document).ready(function () {
  const certificateData = getScriptData('certificate');
  const {imageUrls} = certificateData;
  ReactDOM.render(
    <PrintCertificateBatch imageUrls={imageUrls} />,
    document.getElementById('print-certificate-batch')
  );
});
