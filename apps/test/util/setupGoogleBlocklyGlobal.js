/**
 * Provides the basic frame for running Google Blockly.  In particular, this will
 * create a basic dom, load googleblockly.js  and put the contents into the global
 * space as global.Blockly.
 */

export default function setupGoogleBlocklyGlobal() {
  // Initialize browser environment.
  document.body.innerHTML = '<div id="codeApp"><div id="app"></div></div>';
  // locale file requires Blockly as a global
  var GoogleBlockly = require('blockly/core');
  var initializeGoogleBlocklyWrapper = require('../../src/blockly/googleBlocklyWrapper');
  window.Blockly = initializeGoogleBlocklyWrapper(GoogleBlockly);

  try {
    require('../../lib/blockly/en_us');
  } catch (err) {
    console.log(err);
  }
}
