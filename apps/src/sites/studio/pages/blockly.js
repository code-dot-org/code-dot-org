import CDOBlockly from '@code-dot-org/blockly';
import initializeCdoBlocklyWrapper from './cdoBlocklyWrapper';

window.Blockly = initializeCdoBlocklyWrapper(CDOBlockly);
