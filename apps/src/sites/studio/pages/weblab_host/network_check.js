import $ from 'jquery';
import React from 'react';

import WebLabNetworkCheck from '@cdo/apps/templates/verificationPages/WebLabNetworkCheck';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

$(document).ready(function () {
  const scriptData = document.querySelector('script[data-bramble]');
  const brambleConfig = JSON.parse(scriptData.dataset.bramble);

  createReactRoot(
    <WebLabNetworkCheck studioUrl={brambleConfig.studioUrl} />,
    document.getElementById('weblab-network-check-container')
  );
});
