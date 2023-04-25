import GoogleBlockly from 'blockly/core';
import i18n from '@cdo/locale';

const EMPTY_OPTION = '???';

export default class CdoFieldDropdown extends GoogleBlockly.FieldDropdown {
  static ARROW_CHAR = '\u25BC';
  static NO_OPTIONS_MESSAGE = i18n.uninitialized();

  /** Turn changeHandler into validator
   * @override
   */
  constructor(menuGenerator, opt_changeHandler, opt_alwaysCallChangeHandler) {
    if (menuGenerator.length === 1) {
      console.log('inside Google field dropdown constructor');
      console.log(menuGenerator);
      console.log(opt_alwaysCallChangeHandler);
    }
    let validator;
    if (opt_changeHandler) {
      console.log('opt_changeHandler exists', opt_changeHandler);
      validator = function (val) {
        if (
          this.getSourceBlock() &&
          !this.getSourceBlock().isInsertionMarker_ &&
          this.value_ !== val
        ) {
          console.log('opt_changeHandler assigned to validator');
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
