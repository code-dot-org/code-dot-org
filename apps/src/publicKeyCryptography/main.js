/** @file Main entry file for the publicKeyCryptography bundle, used by the
 *        Public Key Cryptography widget levels. */
import React from 'react';
import ReactDOM from 'react-dom';
import PublicKeyCryptographyWidget from './PublicKeyCryptographyWidget';
import ModuloClockWidget from './ModuloClockWidget';
import {registerGetResult} from '@cdo/apps/code-studio/levels/codeStudioLevels';

// These constants should stay in sync with the levelbuilder options on
// _public_key_cryptography.html.haml
const MODULO_CLOCK_VIEW = 1;
const ALICE_EVE_BOB_VIEW = 2;

function initialize(options) {
  registerGetResult(); // a default getResult function.
  ReactDOM.render(
      parseInt(options.cryptographyWidgetView, 10) === ALICE_EVE_BOB_VIEW ?
          <PublicKeyCryptographyWidget/> :
          <ModuloClockWidget/>,
      document.getElementById('public-key-cryptography-mount'));
}

// Start initialization when DOM is ready.
function onDOMContentLoaded() {
  document.removeEventListener('DOMContentLoaded', onDOMContentLoaded, false);
  // Get options / default options
  const options = {
    cryptographyWidgetView: MODULO_CLOCK_VIEW,
    ...window.options
  };
  initialize(options);
}
document.addEventListener('DOMContentLoaded', onDOMContentLoaded, false);
