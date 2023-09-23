/**
 * Provides the basic frame for running Blockly.  In particular, this will
 * create a basic dom, load blockly.js  and put the contents into the global
 * space as global.Blockly.
 */
import blockly from '@code-dot-org/blockly';
import initializeCdoBlocklyWrapper from '../../src/blockly/cdoBlocklyWrapper';

export default function setupBlocklyGlobal() {
  // Initialize browser environment.
  document.body.innerHTML = '<div id="codeApp"><div id="app"></div></div>';

  // locale file requires Blockly as a global
  window.Blockly = initializeCdoBlocklyWrapper(blockly);

  try {
    require('../../lib/blockly/en_us'); // eslint-disable-line import/no-commonjs
  } catch (err) {
    console.log(err);
  }
}
