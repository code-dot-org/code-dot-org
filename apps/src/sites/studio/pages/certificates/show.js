import React from 'react';
import {Provider} from 'react-redux';

import {getStore} from '@cdo/apps/redux';
import CertificateShare from '@cdo/apps/templates/certificates/CertificateShare';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const store = getStore();
  const certificateData = getScriptData('certificate');
  const {imageAlt, imageUrl, printUrl, announcement} = certificateData;
  createReactRoot(
    <Provider store={store}>
      <CertificateShare
        imageUrl={imageUrl}
        printUrl={printUrl}
        announcement={announcement}
        imageAlt={imageAlt}
      />
    </Provider>,
    document.getElementById('certificate-share')
  );
});
