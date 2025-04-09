import * as GoogleBlockly from 'blockly/core';

export default class CdoPathObjectGeras extends GoogleBlockly.geras.PathObject {
  /**
   * Updates the look of the block to reflect a disabled state.
   * Overridden to skip toggling the blocklyDisabledPattern class.
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
