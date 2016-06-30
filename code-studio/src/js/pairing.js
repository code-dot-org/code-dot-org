/* global dashboard, $ */

import ReactDOM from 'react-dom';
import PairingDialog from './components/pairing/pairing_dialog.jsx';

export default {
  init(pairingUrl, hideUserOptions, showPairingDialog) {
    let pairingDialog;

    function lazyInitDialog() {
      if (!pairingDialog) {
        $('body').append('<div id="pairing"></div>');

        pairingDialog = ReactDOM.render(
          <PairingDialog source={pairingUrl} />,
          document.getElementById('pairing')
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
