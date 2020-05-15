import Blockly from '@code-dot-org/blockly';
import BlocklyWrapper from './blocklyWrapper';

window.Blockly = new BlocklyWrapper(Blockly);
