/**
 * Provides the basic frame for running Blockly.  In particular, this will
 * create a basic dom, load blockly.js  and put the contents into the global
 * space as global.Blockly.
 */

export default function setBlocklyGlobal() {
  // Initialize browser environment.
  document.body.innerHTML = '<div id="codeApp"><div id="app"></div></div>';
  // locale file requires Blockly as a global
  const blockly = require('blockly');
  const initializeGoogleBlocklyWrapper = require('../../src/blockly/googleBlocklyWrapper');

  const messages = require(`blockly/msg/en.js`);

  blockly.setLocale(messages);

  window.Blockly = initializeGoogleBlocklyWrapper(blockly);
}
