import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import getScriptData from '@cdo/apps/util/getScriptData';
import CertificateShare from '@cdo/apps/templates/certificates/CertificateShare';
import {getStore} from '@cdo/apps/redux';

$(document).ready(function () {
  const store = getStore();
  const certificateData = getScriptData('certificate');
  const {imageUrl, printUrl, announcement} = certificateData;
  ReactDOM.render(
    <Provider store={store}>
      <CertificateShare
        imageUrl={imageUrl}
        printUrl={printUrl}
        announcement={announcement}
      />
    </Provider>,
    document.getElementById('certificate-share')
  );
});
