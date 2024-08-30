import GoogleBlockly, {Block} from 'blockly/core';

/** Type of a block that has LOGIC_COMPARE_ONCHANGE_MIXIN */
type CompareBlock = Block & {
  onchange: (this: CompareBlock) => void;
};

/**
 * This override intentionally removes dynamic type validation for the left
 * and right sides of a logic_compare (? == ?) block.
 * Artist binary levels and existing student work use this block to compare
 * characters from strings (ex. '01010101') with the numbers 0 and 1.
 */
const LOGIC_COMPARE_ONCHANGE_MIXIN = {
  /**
   * Called whenever anything on the workspace changes.
   * Allows mismatched types to be compared.
   */
  onchange(this: CompareBlock) {},
};

/**
 * "logic_compare" extension function. Overrides type left and right side type
 * checking for "logic_compare" blocks.
 */
const LOGIC_COMPARE_EXTENSION = function (this: CompareBlock) {
  // Add onchange handler to ensure types are compatible.
  this.mixin(LOGIC_COMPARE_ONCHANGE_MIXIN);
};
export default function registerMutator() {
  if (GoogleBlockly.Extensions.isRegistered('logic_compare')) {
    GoogleBlockly.Extensions.unregister('logic_compare');
  }
  GoogleBlockly.Extensions.register('logic_compare', LOGIC_COMPARE_EXTENSION);
}
