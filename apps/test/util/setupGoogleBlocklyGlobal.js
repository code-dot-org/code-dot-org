/**
 * Provides the basic frame for running Google Blockly.  In particular, this
 * will create a basic dom, load googleblockly.js and put the contents into
 * the global space as global.Blockly.
 */

export default function setGoogleBlocklyGlobal() {
  // Initialize browser environment.
  document.body.innerHTML = '<div id="codeApp"><div id="app"></div></div>';
  // locale file requires Blockly as a global
  var blockly = require('blockly');
  var initializeGoogleBlocklyWrapper = require('../../src/blockly/googleBlocklyWrapper');
  window.Blockly = initializeGoogleBlocklyWrapper(blockly);

  const messages = require(`blockly/msg/en.js`);

  blockly.setLocale(messages);
}
