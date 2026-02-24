import * as BlocklyCore from 'blockly/core';

export function getBlockFields(block: BlocklyCore.Block) {
  const fields: BlocklyCore.Field[] = [];
  block.inputList.forEach(input => {
    input.fieldRow.forEach(field => {
      fields.push(field);
    });
  });
  return fields;
}
