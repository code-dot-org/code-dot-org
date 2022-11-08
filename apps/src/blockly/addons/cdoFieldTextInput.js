import GoogleBlockly from 'blockly/core';

// Override to prevent opening a mobile-specific editor.
// Derived from logic here:
// https://github.com/google/blockly/blob/34634ea57cd43dac9028f1a28e4beb761e60eef6/core/field_textinput.ts#L290-L292
export function noMobileShowEditorOverride(opt_event, opt_quietInput) {
  this.workspace_ = this.sourceBlock_.workspace;
  const quietInput = opt_quietInput || false;
  this.showInlineEditor_(quietInput);
}

export default class CdoFieldTextInput extends GoogleBlockly.FieldTextInput {
  showEditor_ = noMobileShowEditorOverride;
}
