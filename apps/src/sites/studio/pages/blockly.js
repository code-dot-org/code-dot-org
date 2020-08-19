import experiments from '@cdo/apps/util/experiments';

import CDOBlockly from '@code-dot-org/blockly';
import initializeCdoBlocklyWrapper from './cdoBlocklyWrapper';

import GoogleBlockly from 'blockly/core';
import locale from 'blockly/msg/en';
import 'blockly/blocks';
import 'blockly/javascript';
GoogleBlockly.setLocale(locale);
import initializeGoogleBlocklyWrapper from './googleBlocklyWrapper';

if (experiments.isEnabled(experiments.GOOGLE_BLOCKLY)) {
  window.Blockly = initializeGoogleBlocklyWrapper(GoogleBlockly);
} else {
  window.Blockly = initializeCdoBlocklyWrapper(CDOBlockly);
}
