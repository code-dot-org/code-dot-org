import * as GoogleBlockly from 'blockly/core';

export default class CdoPathObject extends GoogleBlockly.blockRendering
  .PathObject {
  /**
   * Updates the look of the block to reflect a disabled state.
   * Overridden to bypass the built-in cross-hatch fill pattern for disabled blocks.
   * @param disabled True if disabled.
   */
  override updateDisabled_(disabled: boolean) {
    // Core Blockly toggles the class blocklyDisabled which also applies a cross-hatch fill pattern.
    if (disabled) {
      this.svgPath.setAttribute('fill-opacity', '0.5');
      this.svgPath.setAttribute('stroke-opacity', '0.5');
    } else {
      this.svgPath.removeAttribute('fill-opacity');
      this.svgPath.removeAttribute('stroke-opacity');
    }
  }

  // The built-in function adds a light filter over the whole block. We want to match our old
  // behavior where highlighting the block adds the same yellow outline as selecting.
  updateHighlighted(highlighted: boolean) {
    this.setClass_('blocklySelected', highlighted);
  }
}
