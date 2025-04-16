import * as GoogleBlockly from 'blockly/core';

export default class CdoPathObjectZelos extends GoogleBlockly.zelos.PathObject {
  /**
   * Updates the look of the block to reflect a disabled state.
   * Overridden to bypass the built-in cross-hatch fill pattern for disabled blocks.
   * @param disabled True if disabled.
   */
  override updateDisabled_(disabled: boolean) {
    this.setClass_('blocklyDisabled', disabled);
  }

  // The built-in function adds a light filter over the whole block. We want to match our old
  // behavior where highlighting the block adds the same yellow outline as selecting.
  updateHighlighted(highlighted: boolean) {
    this.setClass_('blocklySelected', highlighted);
  }
}
