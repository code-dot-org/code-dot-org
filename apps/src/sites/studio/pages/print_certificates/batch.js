import { createRoot } from "react-dom/client";
import React from 'react';
import ReactDOM from 'react-dom';

import PrintCertificateBatch from '@cdo/apps/templates/certificates/PrintCertificateBatch';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const certificateData = getScriptData('certificate');
  const {imageUrls} = certificateData;
  const root = createRoot(document.getElementById('print-certificate-batch'));
  root.render(<PrintCertificateBatch imageUrls={imageUrls} />);
});
