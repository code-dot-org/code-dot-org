import $ from 'jquery';
import React from 'react';

import {createReactRoot} from '@cdo/apps/util/createReactRoot';

import PairingDialog from './components/pairing/PairingDialog.jsx';

export default {
  init(pairingUrl, hideUserOptions, showPairingDialog) {
    let pairingDialog;

    function lazyInitDialog() {
      if (!pairingDialog) {
        const container = document.createElement('div');
        container.id = 'pairing';
        document.body.appendChild(container);

        createReactRoot(
          <PairingDialog
            source={pairingUrl}
            ref={dialog => {
              pairingDialog = dialog;
            }}
          />,
          container
        );
      }
      if (pairingDialog) {
        pairingDialog.open();
      }
    }

    if (showPairingDialog) {
      lazyInitDialog();
    }

    $('#pairing_link')
      .show()
      .click(function () {
        lazyInitDialog();
        hideUserOptions();
        return false;
      });
  },
};
