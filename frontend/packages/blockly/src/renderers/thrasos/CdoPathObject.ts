import * as Blockly from 'blockly/core';

export default class CdoPathObject extends Blockly.blockRendering.PathObject {
  // The built-in function also adds a cross-hatch fill pattern to disabled blocks, which we don't want.
  // Overrriding the function here so we can just set the class but not add the fill pattern.
  updateDisabled_(disabled: boolean) {
    this.setClass_('blocklyDisabled', disabled);
  }

  // The built-in function adds a light filter over the whole block. We want to match our old
  // behavior where highlighting the block adds the same yellow outline as selecting.
  // The built-in function can be used with the 'blockly-glow-highlight' url parameter or experiment.
  updateHighlighted(highlighted: boolean) {
    super.updateHighlighted(highlighted);
  }
}
