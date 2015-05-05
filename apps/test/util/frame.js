/**
 * Provides the basic frame for running Blockly.  In particular, this will
 * create a basic dom, load blockly.js  and put the contents into the global
 * space as global.Blockly.
 */

function setGlobals () {
  // Initialize browser environment.
  document.body.innerHTML = '<div id="app"></div>';
  // locale file requires Blockly as a global
  window.Blockly = require(cdo_app + '../build/package/js/blockly');
  require(cdo_app + '../build/package/js/blockly_locale');
  // TODO (brent) - do we need getBBox here anymore?
}
module.exports = setGlobals;
