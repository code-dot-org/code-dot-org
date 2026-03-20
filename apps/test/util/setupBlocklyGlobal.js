import BlocklyCore from 'blockly/core';
import cookies from 'js-cookie';

import initializeBlocklyWrapper from '@cdo/apps/blockly/blocklyWrapper';

import {blocklyLocaleMap} from '../../src/sites/studio/pages/blocklyLocaleImports.js';

import 'blockly/blocks';

/**
 * Provides the basic frame for running Blockly.  In particular, this will
 * create a basic dom, load blockly.js  and put the contents into the global
 * space as global.Blockly.
 */

export default function setBlocklyGlobal() {
  // Initialize browser environment.
  document.body.innerHTML = '<div id="codeApp"><div id="app"></div></div>';
  // locale file requires Blockly as a global
  var localeFromCookies = cookies.get('language_') || 'en-US';
  var messages =
    blocklyLocaleMap[localeFromCookies.toLocaleLowerCase()] ||
    blocklyLocaleMap['en-us'];
  BlocklyCore.setLocale(messages);
  // Blockly v12+ uses fetch() to preload audio files during inject(), passing
  // relative URLs that node-fetch rejects in the Jest/Node environment.
  // Stub the load method to prevent those fetch calls in tests.
  BlocklyCore.WorkspaceAudio.prototype.load = jest.fn().mockResolvedValue();
  window.Blockly = initializeBlocklyWrapper(BlocklyCore);
}
