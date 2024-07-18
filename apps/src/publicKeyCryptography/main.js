/** @file Main entry file for the publicKeyCryptography bundle, used by the
 *        Public Key Cryptography widget levels. */
import React from 'react';
import {createRoot} from 'react-dom/client';

import {registerGetResult} from '@cdo/apps/code-studio/levels/codeStudioLevels';

import ModuloClockWidget from './ModuloClockWidget';
import PublicKeyCryptographyWidget from './PublicKeyCryptographyWidget';

// These constants should stay in sync with the levelbuilder options on
// _public_key_cryptography.html.haml
const MODULO_CLOCK_VIEW = 1;
const ALICE_EVE_BOB_VIEW = 2;

function initialize(options) {
  registerGetResult(); // a default getResult function.
  const root = createRoot(
    document.getElementById('public-key-cryptography-mount')
  );

  root.render(
    parseInt(options.cryptographyWidgetView, 10) === ALICE_EVE_BOB_VIEW ? (
      <PublicKeyCryptographyWidget />
    ) : (
      <ModuloClockWidget />
    )
  );
}

// Start initialization when DOM is ready.
function onDOMContentLoaded() {
  document.removeEventListener('DOMContentLoaded', onDOMContentLoaded, false);
  // Get options / default options
  const options = {
    cryptographyWidgetView: MODULO_CLOCK_VIEW,
    ...window.options,
  };
  initialize(options);
}
document.addEventListener('DOMContentLoaded', onDOMContentLoaded, false);
