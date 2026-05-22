import * as BlocklyCore from 'blockly/core';
import 'blockly/blocks';
import cookies from 'js-cookie';

import initializeBlocklyWrapper from '@cdo/apps/blockly/blocklyWrapper';

import {blocklyLocaleMap} from './blocklyLocaleImports';

// Blockly provides "messages" files, which are JSON-format files containing human-translated
// strings that are needed by Blockly.
// These files map closely, but not exactly, to our supported locales.
// After importing the desired message set, we need to set the locale in Blockly.
// More information at:
// https://developers.google.com/blockly/guides/configure/web/translations
// https://github.com/RaspberryPiFoundation/blockly/blob/master/msg/json/README.md
const localeFromCookies = cookies.get('language_') || 'en-US';
const messages =
  blocklyLocaleMap[localeFromCookies.toLocaleLowerCase()] ||
  blocklyLocaleMap['en-us'];
BlocklyCore.setLocale(messages);

window.Blockly = initializeBlocklyWrapper(BlocklyCore);
