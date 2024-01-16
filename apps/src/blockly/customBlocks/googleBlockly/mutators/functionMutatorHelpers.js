// Common helper functions for procedure and behavior mutators.
import msg from '@cdo/locale';

// If the definition block has a description property
// in extra state, either add a new editable input field to the block
// for the description (if the modal function editor is enabled),
// or set the description property on the block (if the modal function editor is disabled).
export function setBlockDescription(block, extraState) {
  const description = extraState['description'];
  if (Blockly.useModalFunctionEditor) {
    block
      .appendEndRowInput('DESCRIPTION_ROW')
      .appendField(`${msg.description()} `, 'DESCRIPTION_LABEL')
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
export function getBlockDescription(block) {
  let fieldDescription;
  if (Blockly.useModalFunctionEditor) {
    fieldDescription = block.getFieldValue('DESCRIPTION');
  }
  return fieldDescription || block.description;
}
