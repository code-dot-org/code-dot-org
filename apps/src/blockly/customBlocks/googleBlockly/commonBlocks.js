/**
 * Defines blocks useful in multiple blockly apps
 */

export const blocks = {
  installJoinBlock(blockly) {
    // text_join is included with core Blockly. We register a custom text_join_mutator
    // which adds the plus/minus block UI.
    blockly.Blocks.text_join_simple = blockly.Blocks.text_join;
    blockly.JavaScript.text_join_simple = blockly.JavaScript.text_join;
  },
};
