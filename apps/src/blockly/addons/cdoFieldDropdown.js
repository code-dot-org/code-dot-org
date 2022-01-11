import GoogleBlockly from 'blockly/core';

const EMPTY_OPTION = '???';

export default class FieldDropdown extends GoogleBlockly.FieldDropdown {
  static ARROW_CHAR = '\u25BC';

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

    // For backwards compatibility, we must account for and format existing blocks
    // that are missing the second value (used as the generated code for that option).
    const isMissingSecondValue = menuGenerator.some(
      entry => entry.length === 1
    );

    if (isMissingSecondValue) {
      menuGenerator = menuGenerator.map(entry => {
        return [entry[0], entry[0]];
      });
    }

    super(menuGenerator, validator);
  }

  /** Add special case for ???
   * @override
   */
  doClassValidation_(newValue) {
    if (newValue === EMPTY_OPTION) {
      return newValue;
    } else {
      return super.doClassValidation_(newValue);
    }
  }

  /** Add special case for ???
   * @override
   */
  doValueUpdate_(newValue) {
    if (newValue === EMPTY_OPTION) {
      this.value_ = newValue;
      this.isDirty_ = true;
      this.selectedOption_ = ['???', ''];
    } else {
      super.doValueUpdate_(newValue);
    }
  }
}
