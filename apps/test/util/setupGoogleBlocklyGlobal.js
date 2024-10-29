/**
 * Provides the basic frame for running Google Blockly.  In particular, this
 * will create a basic dom, load googleblockly.js and put the contents into
 * the global space as global.Blockly.
 */

import * as GoogleBlockly from 'blockly/core';

import initializeGoogleBlocklyWrapper from '@cdo/apps/blockly/googleBlocklyWrapper';

export default function setGoogleBlocklyGlobal() {
  // Initialize browser environment.
  document.body.innerHTML = '<div id="codeApp"><div id="app"></div></div>';
  window.Blockly = initializeGoogleBlocklyWrapper(GoogleBlockly);

  const messages = require(`blockly/msg/en.js`);

  GoogleBlockly.setLocale(messages);
}
