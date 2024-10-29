/**
 * Provides the basic frame for running Google Blockly.  In particular, this
 * will create a basic dom, load googleblockly.js and put the contents into
 * the global space as global.Blockly.
 */

import * as GoogleBlockly from 'blockly/core';
import * as en from 'blockly/msg/en';

import initializeGoogleBlocklyWrapper from '@cdo/apps/blockly/googleBlocklyWrapper';

export default function setGoogleBlocklyGlobal() {
  window.Blockly = initializeGoogleBlocklyWrapper(GoogleBlockly);

  GoogleBlockly.setLocale(en);
}
