import GoogleBlockly from 'blockly/core';

export default class FieldLabel extends GoogleBlockly.FieldLabel {
  setText(text) {
    return super.setValue(text);
  }
}
