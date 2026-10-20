import * as Blockly from 'blockly/core';

/**
 * This mixin will add the isFunction property and an isFunctionBlock
 * method that identifies blocks that are representing functions.
 */
const FunctionBlockMixin = {
  isFunction: true,

  isFunctionBlock() {
    return this.isFunction;
  },
};

/**
 * The extended type representing a block with function properties.
 */
export interface FunctionBlockMixinType extends Blockly.Block {
  isFunction: boolean;
  isFunctionBlock(): boolean;
}

/**
 * Determines if the given block is a function block and returns it typed as such.
 */
export function isFunctionBlock(
  block: Blockly.Block,
): block is FunctionBlockMixinType {
  return (
    'isFunctionBlock' in block &&
    typeof (block as unknown as FunctionBlockMixinType).isFunctionBlock ===
      'function'
  );
}

export default FunctionBlockMixin;
