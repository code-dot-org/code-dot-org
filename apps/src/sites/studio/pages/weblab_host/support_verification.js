import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import WebLabSupportVerification from '@cdo/apps/templates/verificationPages/WebLabSupportVerification';

$(document).ready(function() {
  const scriptData = document.querySelector('script[data-bramble]');
  const brambleConfig = JSON.parse(scriptData.dataset.bramble);

  ReactDOM.render(
    <WebLabSupportVerification studioUrl={brambleConfig.studioUrl} />,
    document.getElementById('weblab-support-verification-container')
  );
});
