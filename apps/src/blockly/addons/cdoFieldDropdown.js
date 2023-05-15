import GoogleBlockly from 'blockly/core';
import {EMPTY_OPTION} from '../constants';
import {
  printerStyleNumberRangeToList,
  numberListToString,
} from '@cdo/apps/blockly/utils';

export default class CdoFieldDropdown extends GoogleBlockly.FieldDropdown {
  static fromJson(options) {
    return new CdoFieldDropdown(options.options);
  }

  /**
   * Add special case for '???'.
   * @override
   */
  doClassValidation_(newValue) {
    if (newValue === EMPTY_OPTION) {
      return newValue;
    } else {
      return super.doClassValidation_(newValue);
    }
  }

  /**
   * Add special case for '???'.
   * @override
   */
  doValueUpdate_(newValue) {
    if (newValue === EMPTY_OPTION) {
      this.value_ = newValue;
      this.isDirty_ = true;
      this.selectedOption_ = [EMPTY_OPTION, ''];
    } else {
      super.doValueUpdate_(newValue);
    }
  }

  // loadState(state) {
  //   if (this.loadLegacyState(CdoFieldDropdown, state)) {
  //     return;
  //   }
  //   if (this.isOptionListDynamic()) {
  //     this.getOptions(false);
  //   }
  //   this.setValue(state);
  // }

  // saveState() {
  //   const legacyState = this.saveLegacyState(CdoFieldDropdown);
  //   if (legacyState !== null) {
  //     return legacyState;
  //   }
  //   return this.getValue();
  // }

  /**
   * Converts xml element into dropdown field
   * @param element xml
   * @override
   */
  fromXml(element) {
    console.log('fromXml - element', element);
    // If the field xml contains a `config`, then the dropdown options
    // are determined by `config`.
    // Suppose that `config` is assigned ""ITEM1", "ITEM2", "ITEMX""
    // Then menu dropdown options would be: 'first item', 'second item', 'itemx'.
    // See CDO implementation at https://github.com/code-dot-org/blockly/blob/main/core/ui/fields/field_dropdown.js#L305
    console.log('config', element.getAttribute('config'));
    const config = element.getAttribute('config');
    const configValue = element.config;
    console.log('element.config', configValue);
    console.log('element', element);
    if (config) {
      // set the menuGenerator_ to those config options.
      this.menuGenerator_ = this.getUpdatedOptions(config);
    } else if (configValue) {
      this.menuGenerator_ = this.getUpdatedOptions(configValue);
    }
    // Call super so value is set.
    super.fromXml(element);
  }

  /**
   * Converts dropdown field options into xml element
   * @param element xml
   * @return element
   * @override
   */
  toXml(element) {
    console.log('toXml - element', element);
    console.log('element.getAttribute(config)', element.getAttribute('config'));
    console.log('element.getAttribute(name)', element.getAttribute('name'));
    console.log('this.menuGenerator_', this.menuGenerator_);
    let config = '';
    for (let i = 0; i < this.menuGenerator_.length; i++) {
      config += this.menuGenerator_[i][1] + ',';
    }
    config = config.slice(0, -1);
    element.config = config;
    console.log('element.config', element.config);
    // let test = true;
    // if (test && element.getAttribute('name') === 'COSTUME') {
    //   let config = 'CAT, SLOTH';
    //   console.log('this.config set', config);

    //   // set the menuGenerator_ to those config options.
    //   this.menuGenerator_ = this.getUpdatedOptions(config);
    // }
    super.toXml(element);
    return element;
  }

  /**
   * Converts language-neutral string to humnan-readable string.
   */
  toHumanReadableString(text) {
    return text.replace(/['"]+/g, '').toLowerCase();
  }

  getUpdatedOptions(config) {
    // If `menuGenerator_` is an array, it is an array of options with
    // each option represented by an array containing 2 elements -
    // a human-readable string and a language-neutral string. For example,
    // [['first item', 'ITEM1'], ['second item', 'ITEM2'], ['third item', 'ITEM3']].
    // Options are included in the block definition.
    const originalOptionsMap = Array.isArray(this.menuGenerator_)
      ? this.menuGenerator_.reduce((optionsMap, curr) => {
          optionsMap[curr[1]] = curr[0];
          return optionsMap;
        }, {})
      : {};

    const numberList = printerStyleNumberRangeToList(config);
    // If numberList is assigned a non-empty array, it contains a list of numbers.
    // Convert this list to a string of dropdown options separated by commas and assign to options.
    // Otherwise, assign options to config string.
    // Note that `config` is either a printer-style number range or a string of options separated
    // by commas, but not both. For example, a `config` like "1,6-9, &quot;SLOTH&quot;"
    // would NOT be supported.
    let options =
      numberList.length > 0 ? numberListToString(numberList) : config;
    options = options.split(',').map(val => {
      val = val.trim();
      // If val is one of the options in this.menuGenerator_,
      // human-readable string is displayed.
      if (originalOptionsMap[val]) {
        return [originalOptionsMap[val], val];
      } else {
        // Remove quotes and display option with lowercase characters.
        // For example, "GIRAFFE" would be transformed to giraffe.
        const humanReadableVal = this.toHumanReadableString(val);
        return [humanReadableVal, val];
      }
    });
    return options;
  }
}
