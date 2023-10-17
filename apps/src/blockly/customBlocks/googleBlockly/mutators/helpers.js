import msg from '@cdo/locale';

// In Lab2, the level properties are in Redux, not appOptions. To make this work in Lab2,
// we would need to send that property from the backend and save it in lab2Redux.
const useModalFunctionEditor = window.appOptions?.level?.useModalFunctionEditor;

// If the definition block has a description property
// under definitionBlock.description, move it to the description field
// of the block, and delete the description property from the definition block.
// If the block does not have a description field, don't move the description.
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
