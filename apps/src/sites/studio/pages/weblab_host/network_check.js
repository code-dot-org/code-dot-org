import $ from 'jquery';
import React from 'react';
import {createRoot} from 'react-dom/client';

import WebLabNetworkCheck from '@cdo/apps/templates/verificationPages/WebLabNetworkCheck';

$(document).ready(function () {
  const scriptData = document.querySelector('script[data-bramble]');
  const brambleConfig = JSON.parse(scriptData.dataset.bramble);

  const root = createRoot(
    document.getElementById('weblab-network-check-container')
  );
  root.render(<WebLabNetworkCheck studioUrl={brambleConfig.studioUrl} />);
});
