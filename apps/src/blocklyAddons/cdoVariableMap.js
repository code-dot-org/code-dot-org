import GoogleBlockly from 'blockly/core';

export default class CdoVariableMap extends GoogleBlockly.VariableMap {
  addVariables(variableList) {
    variableList.forEach(varName => this.createVariable(varName));
  }
}
