import GoogleBlockly from 'blockly/core';

export default class Input extends GoogleBlockly.Input {
  setStrictCheck(check) {
    return super.setCheck(check);
  }

  appendTitle(a, b) {
    return super.appendField(a, b);
  }

  getFieldRow() {
    return this.fieldRow;
  }
}
