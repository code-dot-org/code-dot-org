import React from 'react';
import {createRoot} from 'react-dom/client';
import {Provider} from 'react-redux';

import {getStore} from '@cdo/apps/redux';
import CertificateShare from '@cdo/apps/templates/certificates/CertificateShare';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const store = getStore();
  const certificateData = getScriptData('certificate');
  const {imageAlt, imageUrl, printUrl, announcement} = certificateData;
  const root = createRoot(document.getElementById('certificate-share'));

  root.render(
    <Provider store={store}>
      <CertificateShare
        imageUrl={imageUrl}
        printUrl={printUrl}
        announcement={announcement}
        imageAlt={imageAlt}
      />
    </Provider>
  );
});
