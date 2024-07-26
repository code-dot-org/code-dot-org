import GoogleBlockly from 'blockly/core';
import 'blockly/blocks';
import cookies from 'js-cookie';

import {blocklyLocaleMap} from '@cdo/apps/blockly/constants';
import initializeGoogleBlocklyWrapper from '@cdo/apps/blockly/googleBlocklyWrapper';

// Blockly provides "messages" files, which are JSON-format files containing human-translated
// strings that are needed by Blockly.
// These files map closely, but not exactly, to our supported locales.
// After importing the desired message set, we need to set the locale in Blockly.
// More information at:
// https://developers.google.com/blockly/guides/configure/web/translations
// https://github.com/google/blockly/blob/master/msg/json/README.md
const localeFromCookies = cookies.get('language_') || 'en-US';
const blocklyLocale = blocklyLocaleMap[localeFromCookies] || 'en';
const messages = require(`blockly/msg/${blocklyLocale}.js`);

GoogleBlockly.setLocale(messages);

window.Blockly = initializeGoogleBlocklyWrapper(GoogleBlockly);
