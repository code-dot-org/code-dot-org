import GoogleBlockly from 'blockly/core';

export default class Input extends GoogleBlockly.Input {
  setStrictCheck(check) {
    return super.setCheck(check);
  }

  getFieldRow() {
    return this.fieldRow;
  }
}
