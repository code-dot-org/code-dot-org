// Common helper functions for procedure and behavior mutators.
import msg from '@cdo/locale';

// In Lab2, the level properties are in Redux, not appOptions. To make this work in Lab2,
// we would need to send that property from the backend and save it in lab2Redux.
const useModalFunctionEditor = window.appOptions?.level?.useModalFunctionEditor;

// If the definition block has a description property
// in extra state, either add a new editable input field to the block
// for the description (if the modal function editor is enabled),
// or set the description property on the block (if the modal function editor is disabled).
export function handleLoadDescription(block, extraState) {
  const description = extraState['description'];
  if (useModalFunctionEditor) {
    block
      .appendDummyInput('DESCRIPTION_ROW')
      .appendField(`${msg.description()} `, 'DESCRIPTION_LABEL')
      .appendField(new Blockly.FieldTextInput(description), 'DESCRIPTION');
    block.moveInputBefore('DESCRIPTION_ROW', 'STACK');
  } else {
    block.description = description;
  }
}

// Save the description to extra state.
// If the modal function editor is enabled, we get the description
// from the description field on the block. Otherwise we get it from
// the description property on the block.
export function handleSaveDescription(block, extraState) {
  let description = block.description;
  if (useModalFunctionEditor) {
    const descriptionField = block.getField('DESCRIPTION');
    if (descriptionField) {
      description = descriptionField.getValue();
    }
  }
  extraState['description'] = description;
}
