import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import WebLabNetworkCheck from '@cdo/apps/templates/verificationPages/WebLabNetworkCheck';

$(document).ready(function () {
  const scriptData = document.querySelector('script[data-bramble]');
  const brambleConfig = JSON.parse(scriptData.dataset.bramble);

  ReactDOM.render(
    <WebLabNetworkCheck studioUrl={brambleConfig.studioUrl} />,
    document.getElementById('weblab-network-check-container')
  );
});
