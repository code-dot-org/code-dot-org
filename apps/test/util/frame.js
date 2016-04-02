require('require-globify');

/**
 * Provides the basic frame for running Blockly.  In particular, this will
 * create a basic dom, load blockly.js  and put the contents into the global
 * space as global.Blockly.
 */

function setGlobals() {
  // Initialize browser environment.
  document.body.innerHTML = '<div id="codeApp"><div id="app"></div></div>';
  // locale file requires Blockly as a global
  try {
    // Get our (potentially) digested copy of blockly
    window.Blockly = require('../../build/package/js/blockly*js', {mode: 'expand'});
    require('../../lib/blockly/en_us');
  } catch (err) {
    console.log(err);
  }
}
module.exports = setGlobals;
