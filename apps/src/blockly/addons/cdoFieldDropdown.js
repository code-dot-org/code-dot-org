import GoogleBlockly from 'blockly/core';
import _ from 'lodash';

const EMPTY_OPTION = '???';

export default class CdoFieldDropdown extends GoogleBlockly.FieldDropdown {
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

  /**
   * Converts xml element into dropdown field
   * @param element xml
   */
  fromXml(element) {
    // Call super so value is set.
    super.fromXml(element);
    // If `menuGenerator_` is an array, it is an array of options with
    // each option represented as an array containing a human-readable string,
    // and a language-neutral string. For example,
    // [['first item', 'ITEM1'], ['second item', 'ITEM2'], ['third item', 'ITEM3']]
    // Options are included in the block definition.
    // But if the field xml contains `config`, then the dropdown options
    // are determined by `config`.
    // Suppose that `config` is assigned ""ITEM1", "ITEM2", "ITEMX""
    // Then menu dropdown options would be: 'first item', 'second item', 'itemx'.
    // See CDO implementation at https://github.com/code-dot-org/blockly/blob/main/core/ui/fields/field_dropdown.js#L305
    const originalOptionsMap = Array.isArray(this.menuGenerator_)
      ? this.menuGenerator_.reduce((optionsMap, curr) => {
          optionsMap[curr[1]] = curr[0];
          return optionsMap;
        }, {})
      : {};
    const config = element.getAttribute('config');
    let options = null;
    if (config) {
      options = this.printerStyleNumberRangeToList(config);
      // `options` is not a number range, it is a customized config string.
      if (options.length === 0) {
        options = config.split(',').map(val => {
          val = val.trim();
          // If val is a one of the options in this.menuGenerator_,
          // human-readable string is displayed.
          if (originalOptionsMap[val]) {
            return [originalOptionsMap[val], val];
          } else {
            // Remove quotes and display option with lowercase characters.
            // For example, "GIRAFFE" would be transformed to giraffe.
            const humanReadableVal = val.replace(/['"]+/g, '').toLowerCase();
            return [humanReadableVal, val];
          }
        });
      } else {
        // `options` is a list of numbers
        options = options.map(num => {
          const numString = num.toString();
          return [numString, numString];
        });
      }
    }

    // If the config attribute is present in xml, set the menuGenerator_ to those config options.
    if (options) {
      this.menuGenerator_ = options;
    }
  }

  /**
   * Converts dropdown field options into xml element
   * @param element xml
   * @return element
   */
  toXml(element) {
    super.toXml(element);
    if (Array.isArray(this.menuGenerator_)) {
      // Convert options (array of arrays) back into string config.
      const config = this.menuGenerator_
        .map(val => {
          return val[1];
        })
        .join();
      element.setAttribute('config', config);
    }
    return element;
  }

  /**
   * Converts a printer-style string range to an array of numbers
   * e.g., "1,2,4-6" becomes [1,2,4,5,6]
   * @param rangeString {string} printer-style range, e.g., "1,2,4-6"
   * @returns  array of numbers
   */
  printerStyleNumberRangeToList = function (rangeString) {
    const rangeStringNoSpaces = rangeString.replace(/ /g, '');
    const rangeItems = rangeStringNoSpaces.split(',');
    const rangeRegExp = /^(\d+)-(\d+)$/; // e.g., "5-10", "20-30"
    const numberRegExp = /^(\d+)$/; // e.g., "3", "500"
    const fullNumberList = rangeItems.reduce((numberArray, currExp) => {
      const rangeResult = rangeRegExp.exec(currExp);
      const numberResult = numberRegExp.exec(currExp);
      if (rangeResult) {
        const lowerBound = Number(rangeResult[1]);
        const upperNonInclusiveBound = Number(rangeResult[2]) + 1;
        const rangeArray = _.range(lowerBound, upperNonInclusiveBound);
        numberArray = numberArray.concat(rangeArray);
      } else if (numberResult) {
        numberArray.push(Number(numberResult[1]));
      }
      return numberArray;
    }, []);
    return fullNumberList;
  };
}
