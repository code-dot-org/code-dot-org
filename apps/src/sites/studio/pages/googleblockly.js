import GoogleBlockly from 'blockly/core';
import locale from 'blockly/msg/en';
import 'blockly/blocks';
GoogleBlockly.setLocale(locale);
import initializeGoogleBlocklyWrapper from '@cdo/apps/blockly/googleBlocklyWrapper';

window.Blockly = initializeGoogleBlocklyWrapper(GoogleBlockly);
