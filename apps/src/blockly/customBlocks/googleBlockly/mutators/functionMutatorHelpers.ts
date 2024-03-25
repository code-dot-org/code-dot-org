// Common helper functions for procedure and behavior mutators.
import {ProcedureBlock} from '@cdo/apps/blockly/types';
import {commonI18n} from '@cdo/apps/types/locale';

// Add a new editable input field to the block for the description
// (if the modal function editor is enabled), or set the description
// property on the block (if the modal function editor is disabled).
export function setBlockDescription(
  block: ProcedureBlock,
  description: string
) {
  if (Blockly.useModalFunctionEditor) {
    block
      .appendEndRowInput('DESCRIPTION_ROW')
      .appendField(`${commonI18n.description()} `, 'DESCRIPTION_LABEL')
      .appendField(new Blockly.FieldTextInput(description), 'DESCRIPTION');
    const inputToPrecede = block.getInput('flyout_input')
      ? 'flyout_input'
      : 'STACK';
    block.moveInputBefore('DESCRIPTION_ROW', inputToPrecede);
  } else {
    block.description = description;
  }
}

// Get the description from the block.
// If the modal function editor is enabled, we get the description
// from the description field on the block. Otherwise we get it from
// the description property on the block.
export function getBlockDescription(block: ProcedureBlock) {
  let fieldDescription;
  if (Blockly.useModalFunctionEditor) {
    fieldDescription = block.getFieldValue('DESCRIPTION');
  }
  return fieldDescription || block.description;
}
