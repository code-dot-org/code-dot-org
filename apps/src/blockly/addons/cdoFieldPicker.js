import GoogleBlockly from 'blockly/core';

export default class CdoFieldPicker extends GoogleBlockly.Field {
  constructor(value, onChange, onDisplay) {
    super(value);
    this.onChange = onChange;
    this.onDisplay = onDisplay;
    this.SERIALIZABLE = true;
  }

  static fromJson(options) {
    return new CdoFieldPicker(
      options.value,
      options.onChange,
      options.onDisplay
    );
  }

  doClassValidation_(newValue) {
    if (typeof newValue !== 'string') {
      return null;
    }
    return newValue;
  }

  getDisplayText_() {
    let text = this.getText();
    if (!text) {
      return GoogleBlockly.Field.NBSP;
    }
    return this.onDisplay(text);
  }

  showEditor_() {
    this.onChange();
    super.showEditor_();
  }
}
