import GoogleBlockly from 'blockly/core';

// override should probably be in cdoFieldTextInput, then subclass from that here
// how do we make sure all FieldTextInput subclasses to have this customization though?
export default class CdoFieldNumber extends GoogleBlockly.FieldNumber {
  showEditor_(opt_event, opt_quietInput) {
    this.workspace_ = this.sourceBlock_.workspace;
    const quietInput = opt_quietInput || false;
    this.showInlineEditor_(quietInput);
  }
}
