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
  showEditor_() {
    console.log('showEditor_ - thisField');
    super.showEditor_();
    Blockly.WidgetDiv.show(this, null);
    Blockly.WidgetDiv.show(this, null);
    let thisField = this;
    console.log(thisField);

    function callback(e) {
      const menuItem = e.target;
      console.log('menuItem', menuItem);
      console.log('event e', e);
      if (menuItem) {
        let value = menuItem.getValue();
        if (thisField.changeHandler_ && !thisField.alwaysCallChangeHandler_) {
          console.log('changeHandler used in callback');
          // Call any change handler, and allow it to override. This happens
          // inside setValue if alwaysCallChangeHandler_ is true.
          let override = thisField.changeHandler_(value);
          console.log('override', override);
          if (override !== undefined) {
            value = override;
          }
        }
        if (value !== null) {
          thisField.doValueUpdate_(value);
        }
      }
      Blockly.WidgetDiv.hideIfOwner(thisField);
    }
    this.menu_.addEventListener('click', callback);
    // console.log('this.menu_', this.menu_);
    // this.menu_ = new Blockly.Menu();
    // let options = this.getOptions();
    // console.log('menu options', options);
    // console.log('this.menu_', this.menu_);
    // for (var x = 0; x < options.length; x++) {
    //   var text = options[x][0]; // Human-readable text.
    //   var value = options[x][1]; // Language-neutral value.
    //   var menuItem = new Blockly.MenuItem(text, value);
    //   menuItem.setCheckable(true);
    //   this.menu_.addItem(menuItem);
    //   menuItem.setChecked(value === this.value_);
    // }
    // this.menu_.addEventListener('click', callback);
    // const div = Blockly.WidgetDiv.DIV;
    // this.menu_.render(div);
    // this.menu_.setAllowAutoFocus(true);
    // var menuDom = this.menu_.getElement();
    // Blockly.addClass_(menuDom, 'blocklyDropdownMenu');
    // // display menu items without shortcuts
    // Blockly.addClass_(menuDom, 'goog-menu-noaccel');
    // menuDom.style.borderColor =
    //   'hsla(' +
    //   this.sourceBlock_.getColour() +
    //   ', ' +
    //   this.sourceBlock_.getSaturation() * 100 +
    //   '%, ' +
    //   this.sourceBlock_.getValue() * 100 +
    //   '%' +
    //   ', 0.5)';
    // menuDom.style.overflowY = 'auto';
    // menuDom.style['max-height'] = '265px';
  }
}
