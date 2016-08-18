/** @file Main entry file for the publicKeyCryptography bundle, used by the
 *        Public Key Cryptography widget levels. */
import React from 'react';
import ReactDOM from 'react-dom';
import PublicKeyCryptographyWidget from './PublicKeyCryptographyWidget';
import ModuloClockWidget from './ModuloClockWidget';

function initialize() {
  ReactDOM.render(
      <ModuloClockWidget/>,
      document.getElementById('public-key-cryptography-mount'));
}

// Start initialization when DOM is ready.
function onDOMContentLoaded() {
  document.removeEventListener('DOMContentLoaded', onDOMContentLoaded, false);
  initialize();
}
document.addEventListener('DOMContentLoaded', onDOMContentLoaded, false);
