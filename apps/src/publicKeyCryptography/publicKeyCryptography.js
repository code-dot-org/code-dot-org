/** @file Main entry file for the publicKeyCryptography bundle, used by the
 *        Public Key Cryptography widget levels. */

function initialize() {
  console.log('onDomContentLoaded');
}

// Start initialization when DOM is ready.
function onDOMContentLoaded() {
  document.removeEventListener('DOMContentLoaded', onDOMContentLoaded, false);
  initialize();
}
document.addEventListener('DOMContentLoaded', onDOMContentLoaded, false);
