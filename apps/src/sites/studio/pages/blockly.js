import Blockly from '@code-dot-org/blockly';
import initializeCdoBlocklyWrapper from './cdoBlocklyWrapper';

window.Blockly = initializeCdoBlocklyWrapper(Blockly);
