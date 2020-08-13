import experiments from '@cdo/apps/util/experiments';

import CDOBlockly from '@code-dot-org/blockly';
import initializeCdoBlocklyWrapper from './cdoBlocklyWrapper';

import Blockly from 'blockly/core';
import locale from 'blockly/msg/en';
import 'blockly/blocks';
import 'blockly/javascript';
Blockly.setLocale(locale);
import initializeGoogleBlocklyWrapper from './googleBlocklyWrapper';

if (experiments.isEnabled(experiments.GOOGLE_BLOCKLY)) {
  window.Blockly = initializeGoogleBlocklyWrapper(Blockly);
} else {
  window.Blockly = initializeCdoBlocklyWrapper(CDOBlockly);
}
