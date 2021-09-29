import GoogleBlockly from 'blockly/core';

export default class Input extends GoogleBlockly.Input {
  appendTitle(a, b) {
    return super.appendField(a, b);
  }
}
