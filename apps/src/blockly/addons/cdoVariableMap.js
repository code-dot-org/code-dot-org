import GoogleBlockly from 'blockly/core';

export default class CdoVariableMap extends GoogleBlockly.VariableMap {
  addVariables(variableList) {
    // createVariable() is a blockly method
    variableList.forEach(varName => this.createVariable(varName));
  }
}
