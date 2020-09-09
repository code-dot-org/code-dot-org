import GoogleBlockly from 'blockly/core';

export default class FieldDropdown extends GoogleBlockly.FieldDropdown {
  constructor(menuGenerator, opt_changeHandler, opt_alwaysCallChangeHandler) {
    let validator;
    if (opt_changeHandler) {
      validator = function(val) {
        if (
          this.getSourceBlock() &&
          !this.getSourceBlock().isInsertionMarker_ &&
          this.value_ !== val
        ) {
          opt_changeHandler(val);
        }
      };
    }
    super(menuGenerator, validator);
  }
}
