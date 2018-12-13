import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import PairingDialog from './components/pairing/PairingDialog.jsx';

export default {
  init(pairingUrl, hideUserOptions, showPairingDialog) {
    let pairingDialog;

    function lazyInitDialog() {
      if (!pairingDialog) {
        const container = document.createElement('div');
        container.id = 'pairing';
        document.body.appendChild(container);

        pairingDialog = ReactDOM.render(
          <PairingDialog source={pairingUrl} />,
          container
        );
      }
      pairingDialog.open();
    }

    if (showPairingDialog) {
      lazyInitDialog();
    }

    $('#pairing_link').show().click(function () {
      lazyInitDialog();
      hideUserOptions();
      return false;
    });
  }
};
