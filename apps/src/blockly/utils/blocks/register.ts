import {advancedProceduresBlocks} from '@cdo/apps/blockly/addons/plusMinusBlocks/advancedProcedures';
import {blocks as procedureBlocks} from '@cdo/apps/blockly/customBlocks/proceduresBlocks';

// Installs function blocks for all older Blockly labs or Simple2 (Music Lab)
export function registerCustomProcedureBlocks() {
  // Delete both "no return" blocks before redefining them.
  delete Blockly.Blocks['procedures_defnoreturn'];
  delete Blockly.Blocks['procedures_callnoreturn'];
  Blockly.common.defineBlocks(procedureBlocks);
}
// Installs function blocks for Advanced Music Lab
export function registerCustomAdvancedProcedureBlocks() {
  // Delete both definition blocks before redefining them.
  delete Blockly.Blocks['procedures_defnoreturn'];
  delete Blockly.Blocks['procedures_defreturn'];
  Blockly.common.defineBlocks(advancedProceduresBlocks);
}
