/**
 * Defines blocks useful in multiple blockly apps
 */

export const blocks = {
  installJoinBlock(blockly) {
    blockly.Blocks.text_join_simple = blockly.Blocks.text_join;
    blockly.JavaScript.text_join_simple = blockly.JavaScript.text_join;
  },
};
