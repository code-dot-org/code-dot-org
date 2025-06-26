import cookies from 'js-cookie';

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
  var googleBlockly = require('blockly/core');

  // Patch KeyCodes if missing (used by plugins like @blockly/keyboard-navigation)
  googleBlockly.utils ??= {};
  googleBlockly.utils.KeyCodes ??= {
    A: 65,
    S: 83,
    D: 68,
    W: 87,
    SHIFT: 'Shift',
    ESC: 'Escape',
    LEFT: 37,
    RIGHT: 39,
    UP: 38,
    DOWN: 40,
  };

  var initializeGoogleBlocklyWrapper = require('../../src/blockly/googleBlocklyWrapper');
  var localeFromCookies = cookies.get('language_') || 'en-US';
  var messages =
    blocklyLocaleMap[localeFromCookies.toLocaleLowerCase()] ||
    blocklyLocaleMap['en-us'];
  googleBlockly.setLocale(messages);
  window.Blockly = initializeGoogleBlocklyWrapper(googleBlockly);
}
