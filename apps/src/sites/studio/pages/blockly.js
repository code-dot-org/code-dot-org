// import Blockly from '@code-dot-org/blockly';
// import initializeCdoBlocklyWrapper from './cdoBlocklyWrapper';

import Blockly from 'blockly/core';
import locale from 'blockly/msg/en';
import 'blockly/blocks';
import 'blockly/javascript';
Blockly.setLocale(locale);
import initializeGoogleBlocklyWrapper from './googleBlocklyWrapper';

window.Blockly = initializeGoogleBlocklyWrapper(Blockly);
