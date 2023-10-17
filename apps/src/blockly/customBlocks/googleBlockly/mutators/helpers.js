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
    //const inputRow = block.inputList[0];
    block
      .appendDummyInput('DESCRIPTION_ROW')
      .appendField(`${msg.description()} `, 'DESCRIPTION_LABEL')
      .appendField(new Blockly.FieldTextInput(description), 'DESCRIPTION');
    block.moveInputBefore('DESCRIPTION_ROW', 'STACK');
    console.log({
      blockDescription: block.getField('DESCRIPTION').getValue(),
      block,
    });
  } else {
    console.log('skipping setting description on block field');
    console.log({block});
  }
  block.description = description;
}

export function handleSaveDescription(block, extraState) {
  let description = block.description;
  if (useModalFunctionEditor) {
    const descriptionField = block.getField('DESCRIPTION');
    if (descriptionField) {
      description = descriptionField.getValue();
      console.log(`got description value ${description}`);
      //block.removeInput('DESCRIPTION_ROW');
      console.log({block});
    }
    // const descriptionDestinationExists = _.has(block, DESCRIPTION_DESTINATION);
    // console.log('looking for description on block...');
    // console.log({
    //   descriptionDestinationExists,
    //   description: block.inputList[1].fieldRow[1].getValue(),
    // });
    // if (
    //   descriptionDestinationExists &&
    //   block.inputList[1].fieldRow[1].getValue()
    // ) {
    //   description = block.inputList[1].fieldRow[1].getValue();
    //   console.log(`found description on block ${description}`);
    // }
  }
  //console.log(`setting description ${description}`);
  extraState['description'] = description;
}
