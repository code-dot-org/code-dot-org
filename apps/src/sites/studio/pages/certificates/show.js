import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import CertificateShare from '@cdo/apps/templates/CertificateShare';

$(document).ready(function() {
  const certificateData = getScriptData('certificate');
  const {imageUrl, printUrl, announcement} = certificateData;
  ReactDOM.render(
    <CertificateShare
      imageUrl={imageUrl}
      printUrl={printUrl}
      announcement={announcement}
    />,
    document.getElementById('certificate-share')
  );
});
