/**
 * Provides the basic frame for running Blockly.  In particular, this will
 * create a basic dom, load blockly.js  and put the contents into the global
 * space as global.Blockly.
 */
import {BlocklyVersion} from '@cdo/apps/constants';

export default function setBlocklyGlobal(blocklyVersion) {
  // Initialize browser environment.
  document.body.innerHTML = '<div id="codeApp"><div id="app"></div></div>';
  // locale file requires Blockly as a global
  if (blocklyVersion === BlocklyVersion.GOOGLE) {
    const initializeGoogleBlocklyWrapper = require('../../src/blockly/googleBlocklyWrapper');
    const blockly = require('blockly/core');
    require('blockly/blocks');
    require('blockly/javascript');
    window.Blockly = initializeGoogleBlocklyWrapper(blockly);
  } else {
    const blockly = require('@code-dot-org/blockly');
    const initializeCdoBlocklyWrapper = require('../../src/blockly/cdoBlocklyWrapper');
    window.Blockly = initializeCdoBlocklyWrapper(blockly);
  }

  try {
    require('../../lib/blockly/en_us');
  } catch (err) {
    console.log(err);
  }
}
