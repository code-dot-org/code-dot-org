import React from 'react';

import PrintCertificateBatch from '@cdo/apps/templates/certificates/PrintCertificateBatch';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const certificateData = getScriptData('certificate');
  const {imageUrls} = certificateData;
  createReactRoot(
    <PrintCertificateBatch imageUrls={imageUrls} />,
    document.getElementById('print-certificate-batch')
  );
});
