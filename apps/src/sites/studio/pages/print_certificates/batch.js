import React from 'react';
import ReactDOM from 'react-dom';

import PrintCertificateBatch from '@cdo/apps/templates/certificates/PrintCertificateBatch';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const certificateData = getScriptData('certificate');
  const {imageUrls} = certificateData;
  ReactDOM.render(
    <PrintCertificateBatch imageUrls={imageUrls} />,
    document.getElementById('print-certificate-batch')
  );
});
