import GoogleBlockly from 'blockly/core';
import msg from '@cdo/locale';

const ADD_VARIABLE_ID = 'ADD_VARIABLE_ID';
const RENAME_VARIABLE_ID = 'RENAME_VARIABLE_ID';

export default class FieldVariable extends GoogleBlockly.FieldVariable {}

FieldVariable.originalDropdownCreate = FieldVariable.dropdownCreate;
FieldVariable.dropdownCreate = function() {
  const options = FieldVariable.originalDropdownCreate.call(this);

  // Remove the last two options (Delete and Rename)
  options.pop();
  options.pop();

  // Add our custom options (Rename this variable, Rename all)
  options.push([
    msg.renameAll({variableName: this.getText()}),
    RENAME_VARIABLE_ID
  ]);
  options.push([msg.renameThis(), ADD_VARIABLE_ID]);

  return options;
};
