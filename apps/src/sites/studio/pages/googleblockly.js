import GoogleBlockly from 'blockly/core';
import locale from 'blockly/msg/en';
import 'blockly/blocks';
import 'blockly/javascript';
GoogleBlockly.setLocale(locale);
import initializeGoogleBlocklyWrapper from '@cdo/apps/blockly/googleBlocklyWrapper';

window.Blockly = initializeGoogleBlocklyWrapper(GoogleBlockly);
