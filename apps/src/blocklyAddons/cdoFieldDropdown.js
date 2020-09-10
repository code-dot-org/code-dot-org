import GoogleBlockly from 'blockly/core';

export default class FieldDropdown extends GoogleBlockly.FieldDropdown {
  /** Turn changeHandler into validator
   * @override
   */
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

  /** Add special case for ???
   * @override
   */
  doClassValidation_(newValue) {
    if (newValue === '???') {
      return newValue;
    } else {
      return super.doClassValidation_(newValue);
    }
  }

  /** Add special case for ???
   * @override
   */
  doValueUpdate_(newValue) {
    if (newValue === '???') {
      this.value_ = newValue;
      this.isDirty_ = true;
      this.selectedOption_ = ['???', ''];
    } else {
      super.doValueUpdate_(newValue);
    }
  }
}
